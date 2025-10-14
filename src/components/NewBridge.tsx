"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { supportedChains } from "@/lib/chains";
import { BASE_USDC, DEFAULT_INTENT_PAY_CONFIG } from "@/lib/intentPay";
import { checkUSDCTrustline } from "@/lib/stellar";
import { cn } from "@/lib/utils";
import { RozoPayButton, useRozoPayUI } from "@rozoai/intent-pay";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import { DepositIcon } from "./icons/deposit-icon";
import { WithdrawIcon } from "./icons/withdraw-icon";
import { StellarAddressInput } from "./StellarAddressInput";
import { StellarWalletConnect } from "./StellarWalletConnect";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type FlowType = "initial" | "deposit" | "withdraw";

interface TrustlineInfo {
  exists: boolean;
  balance: string;
  loading: boolean;
  error?: string;
}

interface PayData {
  appId: string;
  toChain: number;
  toToken: `0x${string}`;
  toAddress: `0x${string}`;
  toStellarAddress?: string;
  toSolanaAddress?: string;
  toUnits: string;
}

export function NewBridge() {
  const [flowType, setFlowType] = useState<FlowType>("initial");
  const [evmAddress, setEvmAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [trustlineInfo, setTrustlineInfo] = useState<TrustlineInfo>({
    exists: false,
    balance: "0",
    loading: false,
  });
  const [manualStellarAddress, setManualStellarAddress] = useState("");

  const { resetPayment } = useRozoPayUI();

  const [depositData, setDepositData] = useState<PayData | null>(null);
  const [withdrawData, setWithdrawData] = useState<PayData | null>(null);

  // const { isConnected, publicKey } = useStellarWalletConnection();
  const { stellarConnected: isConnected, stellarAddress: publicKey } =
    useStellarWallet();

  // Determine the effective stellar address - prioritize connected wallet, fallback to manual input
  const effectiveStellarAddress = useMemo(
    () => (isConnected && publicKey ? publicKey : manualStellarAddress),
    [isConnected, publicKey, manualStellarAddress]
  );

  // Available chains for withdraw (Base, Solana)
  const withdrawChains = supportedChains.filter(
    (chain) =>
      chain.id === 8453 || // Base
      chain.id === 900 // Solana
  );

  const isValidStellarAddress = (address: string): boolean => {
    return address.startsWith("G") && address.length === 56;
  };

  const isValidEvmAddress = (address: string): boolean => {
    return address.startsWith("0x") && address.length === 42;
  };

  const isValidSolanaAddress = (address: string): boolean => {
    // Solana addresses are base58 encoded and typically 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const getAddressType = useCallback(
    (address: string): "evm" | "solana" | "invalid" => {
      if (isValidEvmAddress(address)) return "evm";
      if (isValidSolanaAddress(address)) return "solana";
      return "invalid";
    },
    []
  );

  // Auto-select chain based on address type
  const autoSelectChain = useCallback(
    (address: string) => {
      const addressType = getAddressType(address);
      if (addressType === "evm") {
        setSelectedChain(8453); // Base
      } else if (addressType === "solana") {
        setSelectedChain(900); // Solana
      }
    },
    [getAddressType]
  );

  const checkTrustline = useCallback(async () => {
    if (!effectiveStellarAddress) return;

    setTrustlineInfo((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const result = await checkUSDCTrustline(effectiveStellarAddress);
      setTrustlineInfo({
        exists: result.exists,
        balance: result.balance,
        loading: false,
      });
    } catch (error) {
      setTrustlineInfo({
        exists: false,
        balance: "0",
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to check trustline",
      });
    }
  }, [effectiveStellarAddress]);

  useEffect(() => {
    if (isConnected && publicKey) {
      setManualStellarAddress(publicKey);
    } else {
      setManualStellarAddress("");
    }
  }, [isConnected, publicKey]);

  // Check USDC trustline when Stellar address is provided
  useEffect(() => {
    if (
      effectiveStellarAddress &&
      isValidStellarAddress(effectiveStellarAddress)
    ) {
      checkTrustline();
    } else {
      setTrustlineInfo({
        exists: false,
        balance: "0",
        loading: false,
      });
    }
  }, [effectiveStellarAddress, checkTrustline]);

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };

  const handleAddressChange = (address: string) => {
    setEvmAddress(address);
    // Auto-select chain if address is valid, clear if empty
    if (address.trim()) {
      autoSelectChain(address);
    } else {
      setSelectedChain(null);
    }
  };

  const handlePay = useCallback(() => {
    if (flowType === "deposit") {
      const data = {
        appId: DEFAULT_INTENT_PAY_CONFIG.appId,
        toChain: BASE_USDC.chainId,
        toToken: getAddress(BASE_USDC.token),
        toAddress: getAddress("0x0000000000000000000000000000000000000000"),
        toStellarAddress: effectiveStellarAddress,
        toUnits: amount,
      };

      setDepositData(data);
      resetPayment(data);
    } else if (flowType === "withdraw") {
      if (selectedChain) {
        const data: PayData = {
          appId: DEFAULT_INTENT_PAY_CONFIG.appId,
          toChain: BASE_USDC.chainId,
          toToken: getAddress(BASE_USDC.token),
          toAddress: getAddress("0x0000000000000000000000000000000000000000"),
          toUnits: amount,
        };

        if (selectedChain === 8453) {
          data.toAddress = getAddress(evmAddress);
        } else if (selectedChain === 900) {
          data.toSolanaAddress = evmAddress;
        }

        setWithdrawData(data);
        resetPayment(data);
      }
    }
  }, [
    flowType,
    effectiveStellarAddress,
    amount,
    selectedChain,
    trustlineInfo,
    evmAddress,
    resetPayment,
  ]);

  useEffect(() => {
    if (amount) {
      setTimeout(() => {
        handlePay();
      }, 500);
    }
  }, [amount]);

  // Initial choice screen
  if (flowType === "initial") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          {/* Flow Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setFlowType("deposit")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DepositIcon className="size-5" />
                  Deposit to Stellar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Deposit USDC from Base, Solana, or Polygon to your Stellar
                  wallet
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Connect Stellar wallet</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Check USDC trustline</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Select amount & pay</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Start Deposit
                </Button>
              </CardFooter>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setFlowType("withdraw")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WithdrawIcon className="size-5" />
                  Withdraw from Stellar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Transfer USDC from Stellar to Base or Solana
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Enter EVM address</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Select amount</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Generate payment</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Start Withdraw
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by Rozo - Visa for stablecoins</p>
          </div>
        </div>
      </div>
    );
  }

  // Deposit flow
  if (flowType === "deposit") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFlowType("initial")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Top up your Stellar Wallet</h1>
            <p className="text-sm text-muted-foreground">
              Deposit USDC from other chains
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Stellar Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connect Wallet Section */}
            <div className="space-y-3 flex flex-col gap-2 items-center">
              <StellarWalletConnect />
            </div>

            {/* Separator */}
            {!isConnected && !publicKey && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            )}

            {/* Manual Address Input Section */}
            <div className="space-y-3">
              <StellarAddressInput
                value={effectiveStellarAddress}
                onChange={setManualStellarAddress}
                label={undefined}
                placeholder="Enter your Stellar address (G...)"
                required
                disabled={!!(isConnected && publicKey)}
              />

              {effectiveStellarAddress ? (
                <>
                  {trustlineInfo.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                      <span>Checking trustline...</span>
                    </div>
                  ) : trustlineInfo.error ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{trustlineInfo.error}</span>
                    </div>
                  ) : trustlineInfo.exists ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Balance: {Number(trustlineInfo.balance).toFixed(2)} USDC
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          USDC trustline not found
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Add a USDC trustline to your Stellar wallet before
                        receiving funds
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>
                    Please provide a Stellar address to check trustline status
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["1", "100", "1000"].map((amountOption) => (
                <Button
                  key={amountOption}
                  variant={amount === amountOption ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amountOption)}
                  className="h-12"
                >
                  {amountOption} USDC
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Other amount:</Label>
              <Input
                id="custom-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        {!depositData && (
          <Button disabled={true} className="w-full h-12" size="lg">
            <ArrowRight className="h-4 w-4 mr-2" />
            Proceed with USDC Top Up
          </Button>
        )}

        {depositData && (
          <RozoPayButton.Custom
            appId={depositData.appId}
            toChain={depositData.toChain!}
            toToken={depositData.toToken!}
            toAddress={depositData.toAddress as `0x${string}`}
            toStellarAddress={depositData.toStellarAddress}
            toUnits={depositData.toUnits}
            onPaymentCompleted={() => {
              toast.success("Top up completed successfully! 🎉", {
                description:
                  "Your USDC has been deposited. It may take a moment to appear in your wallet.",
                duration: 5000,
              });
            }}
            resetOnSuccess
            showProcessingPayout
          >
            {({ show }) => (
              <Button onClick={show} className="w-full h-12" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Proceed with USDC Top Up
              </Button>
            )}
          </RozoPayButton.Custom>
        )}
      </div>
    );
  }

  // Withdraw flow
  if (flowType === "withdraw") {
    const addressType = getAddressType(evmAddress);
    const isValidAddress = addressType !== "invalid";
    const isChainCompatible =
      (addressType === "evm" && selectedChain === 8453) || // Base for EVM
      (addressType === "solana" && selectedChain === 900); // Solana

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFlowType("initial")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quick Top Up
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transfer Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Configure your USDC transfer details
            </p>
          </div>
        </div>

        {/* Destination Address and Chain Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Destination Address & Chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Address Input */}
            <div className="space-y-2">
              <Label htmlFor="destination-address">Destination Address</Label>
              <Input
                id="destination-address"
                type="text"
                value={evmAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Enter EVM (0x...) or Solana address"
                className={cn(
                  evmAddress &&
                    !isValidAddress &&
                    "border-red-300 focus:border-red-500"
                )}
              />

              {/* Address Validation */}
              {evmAddress && (
                <>
                  {!isValidAddress ? (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Invalid address format</span>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Chain Selection */}
            <div className="space-y-3">
              <Label>To Chain</Label>
              <div className="grid grid-cols-2 gap-3">
                {withdrawChains.map((chain) => {
                  const isCompatible =
                    (addressType === "evm" && chain.id === 8453) || // Base for EVM
                    (addressType === "solana" && chain.id === 900); // Solana

                  return (
                    <Button
                      key={chain.id}
                      variant={
                        selectedChain === chain.id ? "default" : "outline"
                      }
                      onClick={() => setSelectedChain(chain.id)}
                      className="h-16 justify-start"
                      disabled={!!(evmAddress && !isCompatible)}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={chain.logo}
                          alt={chain.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-left">
                          <div className="font-medium">{chain.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {chain.ecosystem}
                          </div>
                        </div>
                        {evmAddress && !isCompatible && (
                          <div className="ml-auto">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Chain Compatibility Warning */}
              {evmAddress && isValidAddress && !isChainCompatible && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Selected chain is not compatible with{" "}
                    {addressType === "evm" ? "EVM" : "Solana"} address
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Amount (USDC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["1", "100", "1000"].map((amountOption) => (
                <Button
                  key={amountOption}
                  variant={amount === amountOption ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amountOption)}
                  className="h-12"
                >
                  {amountOption} USDC
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Other amount:</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        {!withdrawData && (
          <Button disabled={true} className="w-full h-12" size="lg">
            <ArrowRight className="h-4 w-4 mr-2" />
            Proceed with USDC Withdraw
          </Button>
        )}

        {withdrawData && (
          <RozoPayButton.Custom
            appId={withdrawData.appId}
            toChain={withdrawData.toChain!}
            toToken={withdrawData.toToken!}
            toAddress={withdrawData.toAddress as `0x${string}`}
            toSolanaAddress={withdrawData.toSolanaAddress}
            toUnits={withdrawData.toUnits}
            onPaymentCompleted={() => {
              toast.success("Withdraw completed successfully! 🎉", {
                description:
                  "Your USDC has been withdrawn. It may take a moment to appear in your wallet.",
                duration: 5000,
              });
            }}
            resetOnSuccess
            showProcessingPayout
          >
            {({ show }) => (
              <Button onClick={show} className="w-full h-12" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Proceed with USDC Withdraw
              </Button>
            )}
          </RozoPayButton.Custom>
        )}
      </div>
    );
  }

  return null;
}
