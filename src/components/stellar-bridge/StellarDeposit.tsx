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
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import ChainsStacked from "../chains-stacked";
import { StellarAddressInput } from "../StellarAddressInput";
import { StellarWalletConnect } from "../StellarWalletConnect";

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
  const [intentConfig, setIntentConfig] = useState<IntentPayConfig | null>();

  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
  } = useStellarWallet();

  const { resetPayment } = useRozoPayUI();

  useEffect(() => {
    const fetchConfig = async () => {
      if (trustlineStatus.exists && amount && stellarAddress) {
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
          <span className="font-bold">Deposit a from any chains</span>
          <StellarWalletConnect />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stellarConnected && (
          <StellarAddressInput
            value={destinationStellarAddress}
            onChange={onDestinationAddressChange}
            placeholder="Enter your Stellar address"
          />
        )}

        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Choose an amount</Label>
              <div className="grid grid-cols-3 gap-3">
                {["25", "100", "1000"].map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    variant={amount === presetAmount ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAmount(presetAmount);
                      setCustomAmount(presetAmount);
                    }}
                    className="h-10"
                  >
                    {presetAmount} USDC
                  </Button>
                ))}
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

              {amount && parseFloat(amount) > 0 && intentConfig ? (
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
                <Button size="lg" className="w-full" disabled>
                  <Wallet className="size-4" />
                  Pay with USDC <ChainsStacked excludeChains={["stellar"]} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
