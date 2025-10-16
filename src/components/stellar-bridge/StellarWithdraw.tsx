"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { useStellarTransfer } from "@/hooks/use-stellar-transfer";
import {
  AlertTriangle,
  ArrowDownLeft,
  Clock,
  DollarSign,
  Fuel,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
  const { stellarConnected, trustlineStatus, checkTrustline, checkXlmBalance } =
    useStellarWallet();
  const { transfer, step, paymentId, setStep } = useStellarTransfer();

  const [toastId, setToastId] = useState<string | number | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [isCustomizeSelected, setIsCustomizeSelected] = useState(false);

  const handleWithdraw = async () => {
    if (toastId) {
      toast.dismiss(toastId);
      setToastId(null);
    }

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
        // Dismiss the loading toast and show error
        if (toastId) {
          toast.dismiss(toastId);
          setToastId(null);
        }
        toast.error("Failed to withdraw");
      }
    } catch (error) {
      // Dismiss the loading toast and show error
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
      toast.error("Failed to withdraw");
      console.error("Failed to withdraw:", error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (step) {
      if (!toastId) {
        const id = toast.loading("Preparing...", {
          position: "bottom-center",
        });
        setToastId(id);
        return;
      }

      if (step === "create-payment") {
        toast.loading("📝 Creating payment order...", {
          id: toastId,
        });
      } else if (step === "sign-transaction") {
        toast.loading("✍️ Sign transaction in wallet", {
          id: toastId,
        });
      } else if (step === "submit-transaction") {
        toast.loading("🚀 Sending to Stellar network...", {
          id: toastId,
        });
      } else if (step === "success") {
        toast.success("Withdrawal complete!", {
          id: toastId,
          action: paymentId
            ? {
                label: "See Receipt",
                type: "button",
                onClick: () => {
                  window.open(
                    `https://invoice.rozo.ai/receipt?id=${paymentId}`,
                    "_blank"
                  );
                  toast.dismiss(toastId);
                  setToastId(null);
                  setStep(null);
                },
              }
            : undefined,
          duration: Infinity,
          closeButton: true,
          description: "Funds incoming to Base. Please check your wallet soon.",
          dismissible: false,
        });
      } else if (step === "error") {
        toast.error("❌ Withdrawal failed. Please try again.", {
          id: toastId,
        });
        setToastId(null);
        setStep(null);
      }
    } else {
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
        setStep(null);
      }
    }
  }, [step, toastId, paymentId]);

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
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="font-bold flex items-center gap-2">
            <ArrowDownLeft className="size-4" />
            Withdraw to Base
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stellarConnected ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Wallet className="size-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                Connect your Stellar wallet for withdrawal
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="withdraw-amount">Choose an amount</Label>
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
                <div className="grid grid-cols-3 gap-3">
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
                          size="sm"
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
                          className="h-10"
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
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        onCustomAmountChange(value);
                        onAmountChange(value);

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
                      min="0"
                      step="0.01"
                      className={`h-10 ${
                        amountError ? "border-red-500 focus:border-red-500" : ""
                      }`}
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

              <div className="flex items-center justify-center gap-4 font-mono">
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Fuel className="size-4" />
                      <span className="text-sm">Free</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gas fee is free</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      &lt;10s
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Typical deposit time</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                onClick={handleWithdraw}
                size="lg"
                className="w-full"
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
