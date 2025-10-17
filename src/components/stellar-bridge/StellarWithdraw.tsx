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
  ChevronDown,
  DollarSign,
  Fuel,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { USDC } from "../icons/chains";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="gap-2 p-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="font-bold flex items-center gap-2">
            <ArrowDownLeft className="size-5" />
            Withdraw to Base
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
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

              {amount && parseFloat(amount) > 1000 && (
                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Bridge Amount Limit
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        The bridge amount is upper bounded $1000 for alpha. Join
                        our Discord (
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
