"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { useStellarTransfer } from "@/hooks/use-stellar-transfer";
import { useToastQueue } from "@/hooks/use-toast-queue";
import { FeeType } from "@rozoai/intent-common";
import { useEffect, useRef } from "react";
import { saveStellarHistory } from "../utils/history";

interface UseWithdrawLogicProps {
  amount: string | undefined;
  baseAddress: string;
  memo?: string;
  onLoadingChange: (loading: boolean) => void;
  feeType: FeeType;
  isAdmin?: boolean;
}

export function useWithdrawLogic({
  amount,
  baseAddress,
  memo,
  onLoadingChange,
  feeType,
  isAdmin = false,
}: UseWithdrawLogicProps) {
  const { stellarAddress, checkTrustline, checkXlmBalance } =
    useStellarWallet();
  const { transfer, step, paymentId, setStep } = useStellarTransfer(
    isAdmin,
    feeType
  );
  const {
    currentToastId,
    updateCurrentToast,
    completeCurrentToast,
    errorCurrentToast,
    dismissCurrentToast,
    clearQueue,
  } = useToastQueue();

  // Store refs for stable callbacks
  const updateToastRef = useRef(updateCurrentToast);
  const completeToastRef = useRef(completeCurrentToast);
  const errorToastRef = useRef(errorCurrentToast);
  const dismissToastRef = useRef(dismissCurrentToast);

  useEffect(() => {
    updateToastRef.current = updateCurrentToast;
    completeToastRef.current = completeCurrentToast;
    errorToastRef.current = errorCurrentToast;
    dismissToastRef.current = dismissCurrentToast;
  });

  // Handle toast progress for withdrawal
  useEffect(() => {
    if (step) {
      if (!currentToastId) {
        updateToastRef.current("Preparing...", {
          position: "bottom-center",
        });
        return;
      }

      if (step === "create-payment") {
        updateToastRef.current("📝 Creating payment order...");
      } else if (step === "sign-transaction") {
        updateToastRef.current("✍️ Sign transaction in wallet");
      } else if (step === "submit-transaction") {
        updateToastRef.current("🚀 Sending to Stellar network...");
      } else if (step === "success") {
        // Save transaction history when withdrawal is successful
        if (stellarAddress && paymentId && amount) {
          try {
            saveStellarHistory(
              stellarAddress,
              paymentId,
              amount,
              baseAddress,
              "withdraw",
              "Stellar",
              "Base"
            );

            // Dispatch custom event to update history
            window.dispatchEvent(new CustomEvent("stellar-payment-completed"));
          } catch (error) {
            console.error("Failed to save transaction history:", error);
          }
        }

        completeToastRef.current("Withdrawal complete!", {
          action: paymentId
            ? {
                label: "See Receipt",
                type: "button",
                onClick: () => {
                  window.open(
                    `https://invoice.rozo.ai/receipt?id=${paymentId}`,
                    "_blank"
                  );
                  dismissToastRef.current();
                  setStep(null);
                },
              }
            : undefined,
          duration: Infinity,
          closeButton: true,
          description: "Funds incoming to Base. Please check your wallet soon.",
          dismissible: true,
        });
      } else if (step === "error") {
        errorToastRef.current("❌ Withdrawal failed. Please try again.", {
          duration: 5000,
          closeButton: true,
        });
        setStep(null);
      }
    }
  }, [
    step,
    currentToastId,
    paymentId,
    stellarAddress,
    amount,
    baseAddress,
    setStep,
  ]);

  const handleWithdraw = async () => {
    if (!amount || amount === "") return;

    // Clear any existing toasts and reset queue
    clearQueue();

    // Reset step state to ensure clean start
    setStep(null);

    // Small delay to ensure previous toast is dismissed
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      onLoadingChange(true);
      const result = await transfer({
        amount: Number(amount).toFixed(2),
        address: baseAddress,
        ...(memo ? { memo } : {}),
      });

      if (result) {
        checkTrustline();
        checkXlmBalance();
      } else {
        errorToastRef.current("Failed to withdraw", {
          duration: 5000,
          closeButton: true,
        });
        setStep(null);
      }
    } catch (error) {
      console.error("Failed to withdraw:", error);

      // Extract meaningful error message
      let errorMessage = "Failed to withdraw";
      if (error && typeof error === "object" && "message" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 504) {
          errorMessage = "Request timeout - please try again";
        } else if (axiosError.response?.status) {
          errorMessage = `Request failed (${axiosError.response.status}) - please try again`;
        } else if (axiosError.message) {
          errorMessage = `Withdrawal failed: ${axiosError.message}`;
        }
      }

      errorToastRef.current(errorMessage, {
        duration: 5000,
        closeButton: true,
      });
      setStep(null);
    } finally {
      onLoadingChange(false);
    }
  };

  return { handleWithdraw };
}
