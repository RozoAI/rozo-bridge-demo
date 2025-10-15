"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import {
  BASE_USDC,
  DEFAULT_INTENT_PAY_CONFIG,
  IntentPayConfig,
} from "@/lib/intentPay";
import { RozoPayButton, useRozoPayUI } from "@rozoai/intent-pay";
import { AlertTriangle, ArrowDownLeft, DollarSign, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import { StellarWalletConnect } from "../StellarWalletConnect";

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
  const [intentConfig, setIntentConfig] = useState<IntentPayConfig | null>();

  const { stellarConnected, trustlineStatus, checkTrustline, checkXlmBalance } =
    useStellarWallet();

  const { resetPayment } = useRozoPayUI();

  useEffect(() => {
    const fetchConfig = async () => {
      if (amount && baseAddress) {
        const config = {
          appId: DEFAULT_INTENT_PAY_CONFIG.appId,
          toChain: BASE_USDC.chainId,
          toAddress: getAddress(baseAddress),
          toToken: getAddress(BASE_USDC.token),
          toUnits: amount,
          metadata: {
            items: [
              {
                name: "Rozo Bridge",
                description: "Deposit USDC to Stellar",
              },
            ],
          },
        };

        await resetPayment(config as never);
        setIntentConfig(config);
      }
    };

    fetchConfig();
  }, [amount, baseAddress]);

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="font-bold">Withdraw to Base</span>
          <StellarWalletConnect />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Choose an amount</Label>
              <div className="grid grid-cols-4 gap-3">
                {["10", "25", "100"].map((presetAmount) => {
                  const maxBalance =
                    stellarConnected && trustlineStatus.exists
                      ? parseFloat(trustlineStatus.balance)
                      : Infinity;
                  const isDisabled =
                    stellarConnected && trustlineStatus.exists
                      ? parseFloat(presetAmount) > maxBalance
                      : false;

                  return (
                    <Button
                      key={presetAmount}
                      variant={amount === presetAmount ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        onAmountChange(presetAmount);
                        onCustomAmountChange(presetAmount);
                        onAmountErrorChange("");
                      }}
                      disabled={isDisabled}
                      className="h-10"
                    >
                      {presetAmount} USDC
                    </Button>
                  );
                })}
                {stellarConnected &&
                  trustlineStatus.exists &&
                  parseFloat(trustlineStatus.balance) > 0 && (
                    <Button
                      variant={
                        amount === trustlineStatus.balance
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        onAmountChange(trustlineStatus.balance);
                        onCustomAmountChange(
                          Number(trustlineStatus.balance).toFixed(2)
                        );
                        onAmountErrorChange("");
                      }}
                      className="h-10"
                    >
                      Max
                    </Button>
                  )}
              </div>
            </div>

            <div className="relative flex items-center justify-center my-1.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative bg-card px-3 text-xs text-muted-foreground">
                Or
              </div>
            </div>

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
                    if (stellarConnected && trustlineStatus.exists && value) {
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
                        onAmountErrorChange("Amount must be greater than 0");
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {stellarConnected && trustlineStatus.exists
                      ? `Available: ${parseFloat(
                          trustlineStatus.balance
                        ).toFixed(2)} USDC`
                      : "Connect wallet to see balance"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <Label htmlFor="base-address">Base Address</Label>
                <Input
                  id="base-address"
                  placeholder="0x..."
                  value={baseAddress}
                  onChange={(e) => onBaseAddressChange(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Show wallet connection status */}
              {!stellarConnected && (
                <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Connect Stellar Wallet
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Connect your Stellar wallet to proceed with withdrawal
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stellarConnected && !trustlineStatus.exists && (
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

              {intentConfig &&
              amount &&
              parseFloat(amount) > 0 &&
              baseAddress &&
              !amountError ? (
                <div className="space-y-3">
                  <RozoPayButton.Custom
                    appId={DEFAULT_INTENT_PAY_CONFIG.appId}
                    toChain={intentConfig.toChain}
                    toToken={intentConfig.toToken}
                    toAddress={getAddress(
                      intentConfig.toAddress as `0x${string}`
                    )}
                    toUnits={intentConfig.toUnits}
                    metadata={intentConfig.metadata as never}
                    onPaymentCompleted={() => {
                      toast.success(`Withdraw is in progress! 🎉`, {
                        description:
                          "Your USDC is being transferred. It may take a moment to appear in your Base wallet.",
                        duration: 5000,
                      });
                      onAmountChange("");
                      onCustomAmountChange("");
                      onBaseAddressChange("");
                      checkTrustline(); // Refresh USDC balance
                      checkXlmBalance(); // Refresh XLM balance
                    }}
                    showProcessingPayout
                  >
                    {({ show }) => (
                      <Button onClick={show} size="lg" className="w-full">
                        <ArrowDownLeft className="size-4" />
                        Withdraw {Number(amount).toFixed(2)} USDC to Base
                      </Button>
                    )}
                  </RozoPayButton.Custom>
                </div>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  <ArrowDownLeft className="size-4" />
                  Withdraw USDC to Base
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
