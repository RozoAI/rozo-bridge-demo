"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { supportedChains } from "@/lib/chains";
import { BASE_USDC, DEFAULT_INTENT_PAY_CONFIG } from "@/lib/intentPay";
import { cn } from "@/lib/utils";
import { RozoPayButton, useRozoPayUI } from "@rozoai/intent-pay";
import { AlertTriangle, DollarSign } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAddress } from "viem";
import ChainsStacked from "./chains-stacked";
import { StellarAddressInput } from "./StellarAddressInput";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
  const [evmAddress, setEvmAddress] = useState("");
  const [stellarAddress, setStellarAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState<number | null>(null);

  const { resetPayment } = useRozoPayUI();

  const [withdrawData, setWithdrawData] = useState<PayData | null>(null);

  const { stellarConnected: isConnected, stellarAddress: publicKey } =
    useStellarWallet();

  // Auto-select Stellar chain and fill address when wallet is connected
  useEffect(() => {
    if (isConnected && publicKey) {
      setSelectedChain(1500); // Stellar Mainnet
      setStellarAddress(publicKey);
    }
  }, [isConnected, publicKey]);

  // Available chains for withdraw (Base, Stellar)
  const withdrawChains = supportedChains.filter(
    (chain) =>
      chain.id === 8453 || // Base
      chain.id === 1500 || // Stellar Mainnet
      chain.id === 1501 // Stellar Testnet
  );

  const isValidStellarAddress = (address: string): boolean => {
    return address.startsWith("G") && address.length === 56;
  };

  const isValidEvmAddress = (address: string): boolean => {
    return address.startsWith("0x") && address.length === 42;
  };

  const getAddressType = useCallback(
    (address: string): "evm" | "stellar" | "invalid" => {
      if (isValidEvmAddress(address)) return "evm";
      if (isValidStellarAddress(address)) return "stellar";
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
      } else if (addressType === "stellar") {
        setSelectedChain(1500); // Stellar Mainnet
      }
    },
    [getAddressType]
  );

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };

  const handleEvmAddressChange = (address: string) => {
    setEvmAddress(address);
    // Auto-select chain if address is valid, clear if empty
    if (address.trim()) {
      autoSelectChain(address);
    } else {
      setSelectedChain(null);
    }
  };

  const handleStellarAddressChange = (address: string) => {
    setStellarAddress(address);
    // Auto-select Stellar chain if address is valid, clear if empty
    if (address.trim()) {
      setSelectedChain(1500); // Stellar Mainnet
    } else {
      setSelectedChain(null);
    }
  };

  const handlePay = useCallback(() => {
    // Get the appropriate address based on selected chain
    const currentAddress = selectedChain === 8453 ? evmAddress : stellarAddress;

    if (!currentAddress) {
      toast.error("Please enter a valid destination address");
      return;
    }

    if (!amount) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (selectedChain) {
      const data: PayData = {
        appId: DEFAULT_INTENT_PAY_CONFIG.appId,
        toChain: BASE_USDC.chainId,
        toToken: getAddress(BASE_USDC.token),
        toAddress: getAddress("0x0000000000000000000000000000000000000000"),
        toUnits: amount,
      };

      if (selectedChain === 8453) {
        data.toAddress = getAddress(currentAddress);
        data.toStellarAddress = "";
      } else if (selectedChain === 1500 || selectedChain === 1501) {
        data.toStellarAddress = currentAddress;
      }

      setWithdrawData(data);
      resetPayment(data);
    }
  }, [amount, selectedChain, evmAddress, stellarAddress]);

  useEffect(() => {
    if (amount && !isProcessTransactionDisabled) {
      setTimeout(() => {
        handlePay();
      }, 500);
    }
  }, [amount, selectedChain]);

  const isProcessTransactionDisabled = useMemo(() => {
    return (
      selectedChain === null ||
      !amount ||
      (selectedChain === 8453 && !evmAddress) ||
      ((selectedChain === 1500 || selectedChain === 1501) && !stellarAddress)
    );
  }, [selectedChain, evmAddress, stellarAddress, amount]);

  // Withdraw flow
  const currentAddress = selectedChain === 8453 ? evmAddress : stellarAddress;
  const addressType = getAddressType(currentAddress);
  const isValidAddress = addressType !== "invalid";
  const isChainCompatible =
    (addressType === "evm" && selectedChain === 8453) || // Base for EVM
    (addressType === "stellar" &&
      (selectedChain === 1500 || selectedChain === 1501)); // Stellar

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col-reverse md:flex-row justify-center md:justify-between items-center gap-2 w-full">
          <div>
            <h1 className="text-2xl font-bold">Transfer Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Configure your USDC transfer details
            </p>
          </div>

          <div className="flex justify-center items-center gap-2">
            <ChainsStacked />
            <span className="text-muted-foreground text-sm">
              Safe and Secure Payments
            </span>
          </div>
        </div>
      </div>

      {/* Destination Address and Chain Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Destination</span>
            {/* <StellarWalletConnect /> */}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {withdrawChains.map((chain) => {
                const isCompatible =
                  (addressType === "evm" && chain.id === 8453) || // Base for EVM
                  (addressType === "stellar" &&
                    (chain.id === 1500 || chain.id === 1501)); // Stellar

                return (
                  <Button
                    key={chain.id}
                    variant={selectedChain === chain.id ? "default" : "outline"}
                    onClick={() => setSelectedChain(chain.id)}
                    className="h-16 justify-start"
                    // disabled={!!(currentAddress && !isCompatible)}
                  >
                    <div className="flex items-center gap-3">
                      {typeof chain.logo === "string" ? (
                        <Image
                          src={chain.logo}
                          alt={chain.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                          {chain.logo}
                        </span>
                      )}
                      <div className="text-left">
                        <div className="font-medium">{chain.name}</div>
                        <div
                          className={cn(
                            "text-xs text-muted-foreground",
                            selectedChain === chain.id && "text-accent"
                          )}
                        >
                          {chain.ecosystem}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Chain Compatibility Warning */}
            {currentAddress && isValidAddress && !isChainCompatible && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Selected chain is not compatible with{" "}
                  {addressType === "evm" ? "EVM" : "Stellar"} address
                </span>
              </div>
            )}
          </div>

          {/* Address Input */}
          {selectedChain && (
            <div className="space-y-2">
              <Label htmlFor="destination-address">Destination Address</Label>
              {selectedChain === 1500 || selectedChain === 1501 ? (
                <StellarAddressInput
                  value={stellarAddress}
                  onChange={handleStellarAddressChange}
                  label={null}
                  placeholder="Enter your Stellar address (G...)"
                  required
                  showValidation={false}
                />
              ) : (
                <Input
                  id="destination-address"
                  type="text"
                  value={evmAddress}
                  onChange={(e) => handleEvmAddressChange(e.target.value)}
                  placeholder="Enter EVM address (0x...)"
                  className={cn(
                    currentAddress &&
                      !isValidAddress &&
                      "border-red-300 focus:border-red-500"
                  )}
                />
              )}

              {/* Address Validation */}
              {currentAddress && (
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
          )}
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
        <Button
          disabled={isProcessTransactionDisabled}
          className="w-full h-12 text-lg"
          size="lg"
        >
          <DollarSign className="size-4" />
          Process Transaction
        </Button>
      )}

      {withdrawData && (
        <RozoPayButton.Custom
          appId={withdrawData.appId}
          toChain={withdrawData.toChain!}
          toToken={withdrawData.toToken!}
          toAddress={withdrawData.toAddress as `0x${string}`}
          toStellarAddress={withdrawData.toStellarAddress}
          toUnits={withdrawData.toUnits}
          onPaymentCompleted={() => {
            toast.success("Withdraw is in progress! 🎉", {
              description:
                "Your USDC is being transferred. It may take a moment to appear in your wallet.",
              duration: 5000,
            });
          }}
          resetOnSuccess
          showProcessingPayout
        >
          {({ show }) => (
            <Button
              onClick={show}
              disabled={isProcessTransactionDisabled}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <DollarSign className="size-4" />
              Process Transaction
            </Button>
          )}
        </RozoPayButton.Custom>
      )}
    </div>
  );
}
