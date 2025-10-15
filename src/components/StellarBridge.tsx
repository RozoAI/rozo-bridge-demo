"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ContactSupport } from "./ContactSupport";
import { StellarDeposit } from "./stellar-bridge/StellarDeposit";
import { StellarWithdraw } from "./stellar-bridge/StellarWithdraw";
import { SupportedBy } from "./SupportedBy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type FlowType = "deposit" | "withdraw";

export function StellarBridge() {
  const [flowType, setFlowType] = useState<FlowType>("deposit");
  const [destinationStellarAddress, setDestinationStellarAddress] =
    useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [amountError, setAmountError] = useState("");

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

      <Tabs
        defaultValue="deposit"
        onValueChange={(value) => setFlowType(value as FlowType)}
        className="w-full flex flex-col"
      >
        <TabsList className="m-auto">
          <TabsTrigger value="deposit" className="text-xs">
            <ArrowUpRight className="size-3 mr-1" />
            Deposit from any chains
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="text-xs">
            <ArrowDownLeft className="size-3 mr-1" />
            Withdraw to Base
          </TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
          <StellarDeposit
            destinationStellarAddress={destinationStellarAddress}
            onDestinationAddressChange={setDestinationStellarAddress}
          />
        </TabsContent>
        <TabsContent value="withdraw">
          <StellarWithdraw
            amount={amount}
            onAmountChange={setAmount}
            customAmount={customAmount}
            onCustomAmountChange={setCustomAmount}
            baseAddress={baseAddress}
            onBaseAddressChange={setBaseAddress}
            amountError={amountError}
            onAmountErrorChange={setAmountError}
          />
        </TabsContent>
      </Tabs>

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

      <SupportedBy />

      <ContactSupport />
    </div>
  );
}
