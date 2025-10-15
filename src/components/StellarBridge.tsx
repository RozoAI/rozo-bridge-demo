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
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  DollarSign,
  Loader2,
  Star,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import ChainsStacked from "./chains-stacked";
import { ContactSupport } from "./ContactSupport";
import { StellarAddressInput } from "./StellarAddressInput";
import { StellarWalletConnect } from "./StellarWalletConnect";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type FlowType = "deposit" | "withdraw";

export function StellarBridge() {
  const [flowType, setFlowType] = useState<FlowType>("deposit");
  const [amount, setAmount] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [destinationStellarAddress, setDestinationStellarAddress] =
    useState("");
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

  // Handle withdraw flow
  const handleWithdraw = async () => {
    if (!stellarConnected) {
      toast.error("Please connect your Stellar wallet first");
      return;
    }

    if (!baseAddress) {
      toast.error("Please enter a Base address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(trustlineStatus.balance)) {
      toast.error("Insufficient USDC balance");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement API proxy call to get bridge address
      // TODO: Implement Stellar SDK transfer
      toast.info(
        "Withdraw functionality will be implemented with API proxy and Stellar SDK"
      );

      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Withdraw failed:", error);
      toast.error("Withdraw failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Create Intent Pay configuration for deposit
  // const intentConfig = useMemo(() => {
  //   if (stellarConnected && trustlineStatus.exists && amount) {
  //     return createIntentConfig({
  //       appId: DEFAULT_INTENT_PAY_CONFIG.appId,
  //       toStellarAddress: stellarAddress,
  //       amount: amount,
  //       externalId: `deposit-${Date.now()}`,
  //     });
  //   }
  //   return null;
  // }, [stellarConnected, trustlineStatus.exists, amount, stellarAddress]);

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Image
            src="/rozo-logo.png"
            alt="Rozo Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          Rozo Bridge
        </h1>
        <p className="text-muted-foreground">
          Transfer USDC between Stellar and other chains
        </p>
      </div>

      {/* Flow Selection Toggle */}
      <div className="flex justify-center">
        <ToggleGroup
          variant="outline"
          type="single"
          value={flowType}
          onValueChange={(value) => {
            if (value) setFlowType(value as FlowType);
          }}
          className="grid w-full max-w-md grid-cols-2"
        >
          <ToggleGroupItem
            value="deposit"
            aria-label="Select deposit flow"
            className="grid grid-cols-[2rem_1fr] gap-2 h-14 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <ArrowUpRight className="size-5 sm:size-6 m-auto" />
            <span className="font-medium">Deposit from any chains</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="withdraw"
            aria-label="Select withdraw flow"
            className="grid grid-cols-[1fr_2rem] gap-2 h-14 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <span className="font-medium ml-auto">Withdraw to Base</span>
            <ArrowDownLeft className="size-5 sm:size-6 m-auto" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Deposit Flow */}
      {flowType === "deposit" && (
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
                onChange={(value) => setDestinationStellarAddress(value)}
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
                        variant={
                          amount === presetAmount ? "default" : "outline"
                        }
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
                      Pay with USDC{" "}
                      <ChainsStacked excludeChains={["stellar"]} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Flow */}
      {flowType === "withdraw" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5" />
              Withdraw from Stellar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!stellarConnected ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Connect your Stellar wallet to continue</p>
              </div>
            ) : !trustlineStatus.exists ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <p>No USDC trustline found</p>
              </div>
            ) : parseFloat(trustlineStatus.balance) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No USDC balance to withdraw</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="withdraw-amount">Amount (USDC)</Label>

                  {/* Preset Amount Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {["10", "25", "50", "100"].map((presetAmount) => {
                      const maxBalance = parseFloat(trustlineStatus.balance);
                      const isDisabled = parseFloat(presetAmount) > maxBalance;

                      return (
                        <Button
                          key={presetAmount}
                          variant={
                            amount === presetAmount ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setAmount(presetAmount);
                            setCustomAmount("");
                          }}
                          disabled={isDisabled}
                          className="h-10"
                        >
                          ${presetAmount}
                        </Button>
                      );
                    })}
                    <Button
                      variant={
                        amount === trustlineStatus.balance
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setAmount(trustlineStatus.balance);
                        setCustomAmount(trustlineStatus.balance);
                      }}
                      className="h-10 bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      Max
                    </Button>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="space-y-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount(e.target.value);
                      }}
                      min="0"
                      max={trustlineStatus.balance}
                      step="0.01"
                      className="h-10"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Available: {trustlineStatus.balance} USDC</span>
                      {customAmount && (
                        <span>Custom: ${customAmount} USDC</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-address">Base Address</Label>
                  <Input
                    id="base-address"
                    placeholder="0x..."
                    value={baseAddress}
                    onChange={(e) => setBaseAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    USDC will be sent to this Base address
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Withdraw to Base only
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Currently, withdrawals are only supported to Base
                        network
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={
                    isProcessing ||
                    !amount ||
                    !baseAddress ||
                    parseFloat(amount) <= 0
                  }
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Withdraw {amount} USDC to Base
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  <p>
                    API proxy integration and Stellar SDK transfer will be
                    implemented
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-10 flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-3">Powered by</span>
        <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
          <div className="flex">
            <a
              href="https://rozo.ai"
              target="_blank"
              rel="noopener noreferrer"
              title="Rozo"
              className="flex items-center"
            >
              <img
                src="/rozo-white-transparent.png"
                alt="Rozo"
                className="h-8 sm:h-12 w-auto transition-opacity group-hover:opacity-80"
              />
              <span className="text-lg sm:text-2xl text-white font-bold">
                ROZO
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="my-10 flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-3">Supported by</span>
        <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
          <div className="flex">
            <a
              href="https://partners.circle.com/partner/rozo"
              target="_blank"
              rel="noopener noreferrer"
              title="Circle - USDC Issuer & Partner"
              className="group relative"
            >
              <img
                src="/circle.svg"
                alt="Circle"
                className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Circle - USDC Issuer & Partner
              </div>
            </a>
          </div>
          <div className="flex">
            <a
              href="https://www.coinbase.com/developer-platform/discover/launches/summer-builder-grants"
              target="_blank"
              rel="noopener noreferrer"
              title="Base - Coinbase's L2 Network"
              className="group relative"
            >
              <img
                src="/base.svg"
                alt="Base"
                className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Base - Coinbase&apos;s L2 Network
              </div>
            </a>
          </div>
          <div className="flex">
            <a
              href="https://x.com/i/broadcasts/1djGXWBqdVdKZ"
              target="_blank"
              rel="noopener noreferrer"
              title="Stellar Community Fund"
              className="group relative"
            >
              <img
                src="/scf.svg"
                alt="Stellar"
                className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Stellar Community Fund
              </div>
            </a>
          </div>
          <div className="flex">
            <a
              href="https://draperuniversity.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Draper University - Entrepreneurship Program"
              className="group relative"
            >
              <img
                src="/draper.webp"
                alt="Draper University"
                className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Draper University - Entrepreneurship Program
              </div>
            </a>
          </div>
        </div>
      </div>

      <ContactSupport />
    </div>
  );
}
