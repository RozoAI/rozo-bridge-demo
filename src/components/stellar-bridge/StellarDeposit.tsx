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
import { AlertTriangle, ArrowUpRight, Clock, Fuel, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import ChainsStacked from "../chains-stacked";

interface StellarDepositProps {
  destinationStellarAddress: string;
  onDestinationAddressChange: (address: string) => void;
}

export function StellarDeposit({
  destinationStellarAddress,
  onDestinationAddressChange,
}: StellarDepositProps) {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomizeSelected, setIsCustomizeSelected] = useState(false);
  const [intentConfig, setIntentConfig] = useState<IntentPayConfig | null>();

  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
  } = useStellarWallet();

  const { resetPayment } = useRozoPayUI();

  const ableToPay = useMemo(() => {
    return amount && (stellarAddress || destinationStellarAddress);
  }, [amount, stellarAddress, destinationStellarAddress]);

  useEffect(() => {
    const fetchConfig = async () => {
      if (ableToPay) {
        const config = {
          appId: DEFAULT_INTENT_PAY_CONFIG.appId,
          toChain: BASE_USDC.chainId,
          toAddress: getAddress("0x0000000000000000000000000000000000000000"),
          toToken: getAddress(BASE_USDC.token),
          toStellarAddress: stellarAddress || destinationStellarAddress,
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
  }, [
    trustlineStatus.exists,
    amount,
    stellarAddress,
    destinationStellarAddress,
  ]);

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="font-bold flex items-center gap-2">
            <ArrowUpRight className="size-4" />
            Deposit from any chains
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stellarConnected ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Wallet className="size-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                Connect your Stellar wallet for deposit
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Choose an amount</Label>
                <div className="grid grid-cols-3 gap-3">
                  {["1", "20", "100", "200", "500", "Customize"].map(
                    (presetAmount) => (
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
                            setAmount("");
                            setCustomAmount("");
                          } else {
                            setIsCustomizeSelected(false);
                            setAmount(presetAmount);
                            setCustomAmount(presetAmount);
                          }
                        }}
                        className="h-10"
                      >
                        {presetAmount === "Customize"
                          ? "Customize"
                          : `${presetAmount} USDC`}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {isCustomizeSelected && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount(e.target.value);
                      }}
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
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

              <div className="flex items-center justify-center gap-4 font-mono">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Fuel className="size-4" />
                  <span className="text-sm">Limited time free</span>
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  &lt;10s
                </span>
              </div>

              {amount && parseFloat(amount) > 0 && intentConfig && ableToPay ? (
                <div className="space-y-3">
                  <RozoPayButton.Custom
                    appId={intentConfig.appId}
                    toChain={intentConfig.toChain}
                    toToken={intentConfig.toToken}
                    toAddress={
                      intentConfig.toAddress ||
                      "0x0000000000000000000000000000000000000000"
                    }
                    toStellarAddress={intentConfig.toStellarAddress}
                    toUnits={intentConfig.toUnits}
                    metadata={intentConfig.metadata as never}
                    onPaymentCompleted={() => {
                      toast.success(`Deposit is in progress! 🎉`, {
                        description:
                          "Your USDC is being transferred. It may take a moment to appear in your wallet.",
                        duration: 5000,
                      });
                      setAmount("");
                      checkTrustline(); // Refresh USDC balance
                      checkXlmBalance(); // Refresh XLM balance
                    }}
                    showProcessingPayout
                  >
                    {({ show }) => (
                      <Button onClick={show} size="lg" className="w-full">
                        <Wallet className="size-4" />
                        Pay with USDC{" "}
                        <ChainsStacked excludeChains={["stellar"]} />
                      </Button>
                    )}
                  </RozoPayButton.Custom>
                </div>
              ) : (
                <Button size="lg" className="w-full" disabled={!ableToPay}>
                  <Wallet className="size-4" />
                  Pay with USDC <ChainsStacked excludeChains={["stellar"]} />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
