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
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  Fuel,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import ChainsStacked from "../chains-stacked";
import { USDC } from "../icons/chains";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
    createTrustline,
    xlmBalance,
  } = useStellarWallet();

  const { resetPayment } = useRozoPayUI();

  const handleCreateTrustline = async () => {
    // Check XLM balance before creating trustline
    const xlmBalanceNum = parseFloat(xlmBalance.balance);
    if (xlmBalanceNum < 1.5) {
      toast.error("Insufficient XLM balance", {
        description:
          "You need at least 1.5 XLM to create a USDC trustline. Please add more XLM to your wallet.",
        duration: 5000,
      });
      return;
    }

    // If balance is sufficient, proceed with trustline creation
    await createTrustline();
  };

  const ableToPay = useMemo(() => {
    return (
      amount &&
      (stellarAddress || destinationStellarAddress) &&
      trustlineStatus.exists
    );
  }, [
    amount,
    stellarAddress,
    destinationStellarAddress,
    trustlineStatus.exists,
  ]);

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
    <Card className="gap-2 p-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="font-bold flex items-center gap-2">
            <ArrowUpRight className="size-5" />
            Deposit from any chains
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
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
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-base font-medium">
                  Choose an amount
                </Label>
                <div className="grid grid-cols-3 gap-4">
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
                        size="lg"
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
                        className="h-14 text-sm font-medium"
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

              {!trustlineStatus.checking &&
                !trustlineStatus.exists &&
                stellarConnected &&
                parseFloat(xlmBalance.balance) >= 1.5 && (
                  <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            USDC Trustline Required
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Your Stellar wallet needs to establish a trustline
                            for USDC to receive deposits. This is a one-time
                            setup.
                          </p>
                        </div>
                        <Button
                          onClick={handleCreateTrustline}
                          disabled={trustlineStatus.checking}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {trustlineStatus.checking
                            ? "Creating..."
                            : "Create USDC Trustline"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

              {!trustlineStatus.checking &&
                !trustlineStatus.exists &&
                stellarConnected &&
                parseFloat(xlmBalance.balance) < 1.5 && (
                  <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-orange-900 dark:text-orange-100">
                          Insufficient XLM Balance
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          You need at least 1.5 XLM to create a USDC trustline.
                          Current balance: {xlmBalance.balance} XLM
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
                      <Button
                        onClick={show}
                        size="lg"
                        className="w-full py-6 text-lg"
                      >
                        <Wallet className="size-5" />
                        Pay with USDC{" "}
                        <ChainsStacked excludeChains={["stellar"]} />
                      </Button>
                    )}
                  </RozoPayButton.Custom>
                </div>
              ) : (
                <Button size="lg" className="w-full py-6" disabled={!ableToPay}>
                  <Wallet className="size-4 " />
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
