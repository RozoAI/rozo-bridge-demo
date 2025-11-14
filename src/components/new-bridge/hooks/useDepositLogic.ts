"use client";

import { AMOUNT_LIMIT } from "@/components/NewBridge";
import { saveStellarHistory } from "@/components/stellar-bridge/utils/history";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import {
  BASE_USDC,
  DEFAULT_INTENT_PAY_CONFIG,
  IntentPayConfig,
} from "@/lib/intentPay";
import { PaymentCompletedEvent } from "@rozoai/intent-common";
import { useRozoPayUI } from "@rozoai/intent-pay";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";

interface UseDepositLogicProps {
  isAdmin: boolean;
  amount: string | undefined;
  destinationStellarAddress?: string;
}

const DEBOUNCE_DELAY = 500; // 500ms debounce

export function useDepositLogic({
  amount,
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

  // Refs for debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetPaymentRef = useRef(resetPayment);

  // Update ref when resetPayment changes
  useEffect(() => {
    resetPaymentRef.current = resetPayment;
  });

  // Check if able to pay
  const ableToPay =
    !!amount &&
    parseFloat(amount) > 0 &&
    (!!stellarAddress || !!destinationStellarAddress) &&
    trustlineStatus.exists &&
    !!intentConfig &&
    !isPreparingConfig &&
    (isAdmin || parseFloat(amount) <= AMOUNT_LIMIT);

  // Debounced config preparation
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

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

    // Set preparing state immediately
    setIsPreparingConfig(true);

    // Debounce the config preparation
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const config: IntentPayConfig = {
          appId: isAdmin
            ? "rozoBridgeStellarAdmin"
            : DEFAULT_INTENT_PAY_CONFIG.appId,
          toChain: BASE_USDC.chainId,
          toAddress: getAddress("0x0000000000000000000000000000000000000000"),
          toToken: getAddress(BASE_USDC.token),
          toStellarAddress: stellarAddress || destinationStellarAddress,
          toUnits: amount,
          metadata: {
            intent: "Deposit",
            items: [
              {
                name: "Rozo Bridge",
                description: "Bridge USDC to Stellar",
              },
            ],
          },
        };

        await resetPaymentRef.current(config as never);
        setIntentConfig(config);
      } catch (error) {
        console.error("Failed to prepare payment config:", error);
        setIntentConfig(null);
      } finally {
        setIsPreparingConfig(false);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    amount,
    stellarAddress,
    destinationStellarAddress,
    trustlineStatus.exists,
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
