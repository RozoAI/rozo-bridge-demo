/**
 * @module hooks/use-sep24-withdrawal
 * @description Custom hook for managing SEP-24 withdrawal flow with anchor authentication
 */

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { DEFAULT_INTENT_PAY_CONFIG } from "@/lib/intentPay";
import { PaymentPayload } from "@/lib/payment-api";
import { logger } from "@/lib/stellar/debug-logger";
import { authenticate } from "@/lib/stellar/sep10";
import {
  initiateTransfer24,
  openTransferPopup,
  setupTransferCallback,
  TransferCallbackData,
} from "@/lib/stellar/sep24";
import { useAnchorAuthStore } from "@/store/anchor-auth";
import { RozoPayOrderView } from "@rozoai/intent-common";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseSep24WithdrawalOptions {
  anchorDomain: string;
  assetCode: string;
  onTransferComplete?: (data: TransferCallbackData) => void;
}

export function useSep24Withdrawal({
  anchorDomain,
  assetCode,
  onTransferComplete,
}: UseSep24WithdrawalOptions) {
  const { stellarAddress, stellarKit } = useStellarWallet();
  const { getToken, setToken, isTokenValid } = useAnchorAuthStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitiatingTransfer, setIsInitiatingTransfer] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  /**
   * Authenticates with the anchor using SEP-10
   */
  const authenticateWithAnchor = useCallback(async (): Promise<string> => {
    logger.hookInfo("Authenticating with anchor", { anchorDomain });

    if (!stellarAddress || !stellarKit) {
      logger.hookError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    // Check if we already have a valid token
    const existingToken = getToken(anchorDomain);
    if (existingToken && isTokenValid(anchorDomain)) {
      logger.hookSuccess("Using existing valid token", { anchorDomain });
      return existingToken;
    }

    setIsAuthenticating(true);
    logger.flowStart("Hook: Authenticate with Anchor", {
      stellarAddress,
      anchorDomain,
    });

    try {
      // Define sign function for SEP-10 challenge
      const signTransaction = async (xdr: string): Promise<string> => {
        logger.hookInfo("Requesting user signature");
        const signedResult = await stellarKit.signTransaction(xdr);
        logger.hookSuccess("User signed transaction");
        return signedResult.signedTxXdr;
      };

      // Authenticate and get token
      const token = await authenticate({
        publicKey: stellarAddress,
        homeDomain: anchorDomain,
        signTransaction,
      });

      // Store token
      setToken(anchorDomain, token);

      toast.success("Authenticated with anchor");
      logger.flowEnd("Hook: Authenticate with Anchor", true);
      return token;
    } catch (error) {
      console.error("Failed to authenticate with anchor:", error);
      logger.flowEnd("Hook: Authenticate with Anchor", false, {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    stellarAddress,
    stellarKit,
    anchorDomain,
    getToken,
    isTokenValid,
    setToken,
  ]);

  /**
   * Initiates a SEP-24 withdrawal with payment-api integration
   */
  const initiateWithdrawal = useCallback(
    async ({
      amount,
      destinationAddress,
    }: {
      amount: string;
      destinationAddress: string;
    }) => {
      logger.flowStart("Hook: Initiate SEP-24 Withdrawal with Bridge", {
        amount,
        destinationAddress,
        assetCode,
        anchorDomain,
      });

      if (!stellarAddress) {
        logger.hookError("Wallet not connected");
        toast.error("Please connect your wallet first");
        return;
      }

      setIsInitiatingTransfer(true);

      try {
        // Step 1: Create payment order to get bridge address
        logger.flowStep(1, "Create payment order (get bridge address)");

        const paymentPayload: PaymentPayload = {
          appId: DEFAULT_INTENT_PAY_CONFIG.appId,
          display: {
            intent: "Withdraw",
            paymentValue: amount,
            currency: "USD",
          },
          destination: {
            destinationAddress: destinationAddress, // Final Base address
            chainId: "8453",
            amountUnits: amount,
            tokenSymbol: "USDC",
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          },
          metadata: {
            intent: "Withdraw",
            items: [
              {
                name: "Withdraw",
                description: "Transfer USDC Stellar to Base",
              },
            ],
            payer: {},
          },
          preferredChain: "1500", // Stellar
          preferredToken: "USDC",
        };

        const rozoUrl = process.env.NEXT_PUBLIC_ROZO_API_URL;
        const rozoKey = process.env.NEXT_PUBLIC_ROZO_API_KEY;

        logger.hookInfo("Calling payment-api", { rozoUrl });
        const response = await fetch(`${rozoUrl}/payment-api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rozoKey}`,
          },
          body: JSON.stringify(paymentPayload),
        });

        if (!response.ok) {
          throw new Error(
            `Payment API request failed: ${response.status} ${response.statusText}`
          );
        }

        const paymentData = (await response.json()) as RozoPayOrderView;
        const bridgeAddress = paymentData.metadata?.receivingAddress;
        const memo = paymentData.metadata?.memo;

        if (!bridgeAddress) {
          throw new Error("No bridge address received from payment API");
        }

        logger.hookSuccess("Bridge address received", {
          bridgeAddress,
          memo,
          paymentId: paymentData.id,
        });

        // Step 2: Authenticate with anchor for SEP-24
        logger.flowStep(2, "Authenticate with anchor (SEP-10)");
        const authToken = await authenticateWithAnchor();

        // Step 3: Initiate SEP-24 interactive flow
        logger.flowStep(3, "Initiate SEP-24 KYC flow");
        const { url, id } = await initiateTransfer24({
          authToken,
          endpoint: "withdraw",
          homeDomain: anchorDomain,
          urlFields: {
            asset_code: assetCode,
            account: stellarAddress,
            amount: amount,
            // Include bridge address as destination
            destination: bridgeAddress,
            memo: memo,
          },
        });

        // Step 4: Open popup with callback
        logger.flowStep(4, "Open KYC popup");
        const callbackUrl = `${url}&callback=postMessage`;
        const popup = openTransferPopup(callbackUrl, "rozoSep24Withdrawal");
        setPopupWindow(popup);

        // Step 5: Listen for completion
        logger.flowStep(5, "Setup callback listener");
        const cleanup = setupTransferCallback((data) => {
          logger.hookSuccess("SEP-24 KYC completed via callback");
          // Close popup if still open
          popup?.close();
          setPopupWindow(null);

          // Merge bridge data with callback data
          const mergedData = {
            ...data,
            transaction: {
              ...data.transaction,
              // Override with bridge address, not anchor's address
              withdraw_anchor_account: bridgeAddress,
              withdraw_memo: memo,
              withdraw_memo_type: "text",
            },
            bridgeInfo: {
              paymentId: paymentData.id,
              bridgeAddress,
              memo,
              finalDestination: destinationAddress,
            },
          };

          // Call completion handler with merged data
          if (onTransferComplete) {
            onTransferComplete(mergedData as any);
          }

          // Clean up listener
          cleanup();
        });

        // Check if popup was blocked
        if (!popup || popup.closed) {
          logger.hookWarning("Popup was blocked");
          toast.error("Popup was blocked. Please allow popups for this site.");
          cleanup();
        }

        logger.flowEnd("Hook: Initiate SEP-24 Withdrawal with Bridge", true, {
          transferId: id,
          paymentId: paymentData.id,
          bridgeAddress,
        });

        return {
          url: callbackUrl,
          transferId: id,
          paymentId: paymentData.id,
          bridgeAddress,
          memo,
        };
      } catch (error) {
        console.error("Failed to initiate withdrawal:", error);
        logger.flowEnd("Hook: Initiate SEP-24 Withdrawal with Bridge", false, {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(
          `Failed to initiate withdrawal: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        throw error;
      } finally {
        setIsInitiatingTransfer(false);
      }
    },
    [
      stellarAddress,
      anchorDomain,
      assetCode,
      authenticateWithAnchor,
      onTransferComplete,
    ]
  );

  /**
   * Closes the popup window if open
   */
  const closePopup = useCallback(() => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
      setPopupWindow(null);
    }
  }, [popupWindow]);

  return {
    authenticateWithAnchor,
    initiateWithdrawal,
    closePopup,
    isAuthenticating,
    isInitiatingTransfer,
    isPopupOpen: !!popupWindow && !popupWindow.closed,
  };
}
