"use client";

import { TokenAmountInput } from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { useStellarTransfer } from "@/hooks/use-stellar-transfer";
import { useToastQueue } from "@/hooks/use-toast-queue";
import {
  AlertTriangle,
  ArrowDownLeft,
  ChevronDown,
  DollarSign,
  Fuel,
  Loader2,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { USDC } from "../icons/chains";
import { saveStellarHistory } from "./utils/history";

interface StellarWithdrawProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  customAmount: string;
  onCustomAmountChange: (amount: string) => void;
  baseAddress: string;
  onBaseAddressChange: (address: string) => void;
  amountError: string;
  onAmountErrorChange: (error: string) => void;
}

const AMOUNT_LIMIT = 500;

export function StellarWithdraw({
  amount,
  onAmountChange,
  customAmount,
  onCustomAmountChange,
  baseAddress,
  onBaseAddressChange,
  amountError,
  onAmountErrorChange,
}: StellarWithdrawProps) {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "rozo";

  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
  } = useStellarWallet();
  const { transfer, step, paymentId, setStep } = useStellarTransfer(isAdmin);
  const {
    currentToastId,
    updateCurrentToast,
    completeCurrentToast,
    errorCurrentToast,
    dismissCurrentToast,
    clearQueue,
  } = useToastQueue();

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [isCustomizeSelected, setIsCustomizeSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-select Customize when balance is below 1 USDC
  useEffect(() => {
    if (
      stellarConnected &&
      trustlineStatus.exists &&
      parseFloat(trustlineStatus.balance) < 1
    ) {
      setIsCustomizeSelected(true);
      onAmountChange("");
      onCustomAmountChange("");
      onAmountErrorChange("");
    }
  }, [
    stellarConnected,
    trustlineStatus.exists,
    trustlineStatus.balance,
    onAmountChange,
    onCustomAmountChange,
    onAmountErrorChange,
  ]);

  const handleWithdraw = async () => {
    // Clear any existing toasts and reset queue
    clearQueue();

    // Reset step state to ensure clean start
    setStep(null);

    // Small delay to ensure previous toast is dismissed
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      setWithdrawLoading(true);
      const result = await transfer({
        bridge: true,
        payload: {
          amount: Number(amount).toFixed(2),
          address: baseAddress,
        },
      });

      if (result) {
        checkTrustline();
        checkXlmBalance();
      } else {
        errorCurrentToast("Failed to withdraw");
        setStep("error");
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

      errorCurrentToast(errorMessage);
      setStep("error");
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (step) {
      if (!currentToastId) {
        updateCurrentToast("Preparing...", {
          position: "bottom-center",
        });
        return;
      }

      if (step === "create-payment") {
        updateCurrentToast("📝 Creating payment order...");
      } else if (step === "sign-transaction") {
        updateCurrentToast("✍️ Sign transaction in wallet");
      } else if (step === "submit-transaction") {
        updateCurrentToast("🚀 Sending to Stellar network...");
      } else if (step === "success") {
        // Save transaction history when withdrawal is successful
        if (stellarAddress && paymentId) {
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

        completeCurrentToast("Withdrawal complete!", {
          action: paymentId
            ? {
                label: "See Receipt",
                type: "button",
                onClick: () => {
                  window.open(
                    `https://invoice.rozo.ai/receipt?id=${paymentId}`,
                    "_blank"
                  );
                  dismissCurrentToast();
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
        errorCurrentToast("❌ Withdrawal failed. Please try again.");
        setStep(null);
      }
    } else {
      if (currentToastId) {
        dismissCurrentToast();
        setStep(null);
      }
    }
  }, [
    step,
    currentToastId,
    paymentId,
    updateCurrentToast,
    completeCurrentToast,
    errorCurrentToast,
    dismissCurrentToast,
    stellarAddress,
    amount,
    baseAddress,
  ]);

  const ableToWithdraw = useMemo(() => {
    return (
      stellarConnected &&
      trustlineStatus.exists &&
      parseFloat(trustlineStatus.balance) > 0 &&
      baseAddress
    );
  }, [
    stellarConnected,
    trustlineStatus.exists,
    trustlineStatus.balance,
    baseAddress,
  ]);

  return (
    <Card className="gap-2 p-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="text-sm sm:text-lg font-bold flex items-center gap-2">
            <ArrowDownLeft className="size-4 sm:size-5" />
            Withdraw to Base
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {!stellarConnected ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Wallet className="size-10 sm:size-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-lg font-medium">
                Connect your Stellar wallet for withdrawal
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="withdraw-amount"
                    className="text-base font-medium"
                  >
                    Choose an amount
                  </Label>
                  {stellarConnected && trustlineStatus.exists && (
                    <span className="text-xs text-muted-foreground">
                      Balance:{" "}
                      {parseFloat(trustlineStatus.balance).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      USDC
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["1", "20", "100", "200", "500", "Customize"].map(
                    (presetAmount) => {
                      const maxBalance =
                        stellarConnected && trustlineStatus.exists
                          ? parseFloat(trustlineStatus.balance)
                          : Infinity;
                      const isDisabled =
                        presetAmount !== "Customize" &&
                        stellarConnected &&
                        trustlineStatus.exists
                          ? parseFloat(presetAmount) > maxBalance
                          : false;

                      return (
                        <Button
                          key={presetAmount}
                          variant={
                            presetAmount === "Customize"
                              ? isCustomizeSelected
                                ? "default"
                                : "outline"
                              : amount === presetAmount
                              ? "default"
                              : "outline"
                          }
                          size="lg"
                          onClick={() => {
                            if (presetAmount === "Customize") {
                              setIsCustomizeSelected(true);
                              onAmountChange("");
                              onCustomAmountChange("");
                              onAmountErrorChange("");
                            } else {
                              setIsCustomizeSelected(false);
                              onAmountChange(presetAmount);
                              onCustomAmountChange(presetAmount);
                              onAmountErrorChange("");
                            }
                          }}
                          disabled={isDisabled}
                          className="h-14 text-sm font-medium"
                        >
                          {presetAmount === "Customize"
                            ? "Customize"
                            : `${presetAmount} USDC`}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>

              {isCustomizeSelected && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <TokenAmountInput
                      amount={customAmount}
                      setAmount={(value) => {
                        onCustomAmountChange(value || "");
                        onAmountChange(value || "");

                        // Validate amount against balance
                        if (
                          stellarConnected &&
                          trustlineStatus.exists &&
                          value
                        ) {
                          const inputAmount = parseFloat(value);
                          const availableBalance = parseFloat(
                            trustlineStatus.balance
                          );

                          if (inputAmount > availableBalance) {
                            onAmountErrorChange(
                              `Amount exceeds available balance of ${parseFloat(
                                trustlineStatus.balance
                              ).toFixed(2)} USDC`
                            );
                          } else if (inputAmount <= 0) {
                            onAmountErrorChange(
                              "Amount must be greater than 0"
                            );
                          } else {
                            onAmountErrorChange("");
                          }
                        } else {
                          onAmountErrorChange("");
                        }
                      }}
                      isLoading={false}
                      token={{
                        symbol: "USDC",
                        decimals: 6,
                      }}
                      className={`h-10 ${
                        amountError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      disabled={!stellarConnected || !trustlineStatus.exists}
                    />
                    {amountError && (
                      <p className="text-xs text-red-500">{amountError}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="base-address">Base Address</Label>
                <Input
                  id="base-address"
                  placeholder="0x..."
                  value={baseAddress}
                  onChange={(e) => onBaseAddressChange(e.target.value)}
                  className="h-10"
                />
              </div>

              {stellarConnected &&
                !trustlineStatus.checking &&
                !trustlineStatus.exists && (
                  <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          No USDC Trustline
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          You need to establish a USDC trustline to withdraw
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {stellarConnected &&
                !trustlineStatus.checking &&
                trustlineStatus.exists &&
                parseFloat(trustlineStatus.balance) === 0 && (
                  <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          No USDC Balance
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          You need USDC in your Stellar wallet to withdraw
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {!isAdmin && amount && parseFloat(amount) > AMOUNT_LIMIT && (
                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Bridge Amount Limit
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        The bridge amount is upper bounded ${AMOUNT_LIMIT} for
                        alpha. Join our Discord (
                        <a
                          href="https://discord.com/invite/EfWejgTbuU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          here
                        </a>
                        ) for updates to unlock the limits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {amount && parseFloat(amount) > 0 && (
                <div className="flex items-center justify-center">
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-3 text-sm font-mono"
                    >
                      <p className="flex items-center gap-1">
                        <USDC className="size-4" />
                        <span>{amount} USDC</span>
                        <span className="text-muted-foreground">in</span>
                        <span>~10s</span>
                      </p>
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Fuel className="size-4" />
                          <span>Limited time free</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleWithdraw}
                size="lg"
                className="w-full py-6"
                disabled={
                  !ableToWithdraw ||
                  !stellarConnected ||
                  !trustlineStatus.exists ||
                  parseFloat(trustlineStatus.balance) === 0 ||
                  withdrawLoading
                }
              >
                {withdrawLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowDownLeft className="size-4" />
                )}
                Withdraw {Number(amount).toFixed(2)} USDC to Base
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
