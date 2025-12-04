"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { IntentPayConfig } from "@/lib/intentPay";
import {
  FeeType,
  PaymentCompletedEvent,
  rozoStellarUSDC,
} from "@rozoai/intent-common";
import { useRozoPayUI } from "@rozoai/intent-pay";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { saveStellarHistory } from "../utils/history";

interface UseDepositLogicProps {
  appId: string;
  isAdmin: boolean;
  amount: string | undefined;
  feeType: FeeType;
  destinationStellarAddress?: string;
}

export function useDepositLogic({
  appId,
  amount,
  feeType,
  destinationStellarAddress,
  isAdmin = false,
}: UseDepositLogicProps) {
  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
  } = useStellarWallet();

  const { resetPayment } = useRozoPayUI();

  const [intentConfig, setIntentConfig] = useState<IntentPayConfig | null>(
    null
  );
  const [isPreparingConfig, setIsPreparingConfig] = useState(false);

  // Check if able to pay
  const ableToPay =
    !!amount &&
    parseFloat(amount) > 0 &&
    (!!stellarAddress || !!destinationStellarAddress) &&
    trustlineStatus.exists &&
    !!intentConfig &&
    !isPreparingConfig;

  // Config preparation (no debounce needed - handled in parent)
  useEffect(() => {
    // If no amount or trustline doesn't exist, clear config
    if (
      !amount ||
      parseFloat(amount) <= 0 ||
      !trustlineStatus.exists ||
      !(stellarAddress || destinationStellarAddress)
    ) {
      setIntentConfig(null);
      setIsPreparingConfig(false);
      return;
    }

    // Set preparing state and prepare config
    setIsPreparingConfig(true);

    const prepareConfig = async () => {
      try {
        const config: IntentPayConfig = {
          appId: appId,
          feeType: feeType,
          toChain: rozoStellarUSDC.chainId,
          toAddress: destinationStellarAddress || stellarAddress,
          toToken: rozoStellarUSDC.token,
          toUnits: amount,
          metadata: {
            intent: "Deposit",
            items: [
              {
                name: "ROZO Intents",
                description: "Transfer USDC to Stellar",
              },
            ],
          },
        };

        await resetPayment(config as any);
        setIntentConfig(config);
      } catch (error) {
        console.error("Failed to prepare payment config:", error);
        setIntentConfig(null);
      } finally {
        setIsPreparingConfig(false);
      }
    };

    prepareConfig();
  }, [
    amount,
    stellarAddress,
    destinationStellarAddress,
    trustlineStatus.exists,
    isAdmin,
  ]);

  const handlePaymentCompleted = (paymentData: PaymentCompletedEvent) => {
    toast.success(`Deposit is in progress! 🎉`, {
      description:
        "Your USDC is being transferred. It may take a moment to appear in your wallet.",
      duration: 5000,
    });

    // Save transaction history
    if (stellarAddress && paymentData.rozoPaymentId && amount) {
      try {
        saveStellarHistory(
          stellarAddress,
          paymentData.rozoPaymentId,
          amount,
          stellarAddress || destinationStellarAddress || "",
          "deposit",
          "Base", // From Base (or other chains)
          "Stellar" // To Stellar
        );

        // Dispatch custom event to update history
        window.dispatchEvent(new CustomEvent("stellar-payment-completed"));
      } catch (error) {
        console.error("Failed to save transaction history:", error);
      }
    }

    // Refresh balances
    checkTrustline();
    checkXlmBalance();
  };

  return {
    intentConfig,
    ableToPay,
    isPreparingConfig,
    stellarConnected,
    handlePaymentCompleted,
  };
}
