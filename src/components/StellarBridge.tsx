"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ContactSupport } from "./ContactSupport";
import { PoweredBy } from "./PoweredBy";
import { StellarDeposit } from "./stellar-bridge/StellarDeposit";
import { StellarWithdraw } from "./stellar-bridge/StellarWithdraw";
import { StellarWalletConnect } from "./StellarWalletConnect";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/rozo-logo.png"
            alt="Rozo Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-2xl font-bold">ROZO</span>
        </div>

        <StellarWalletConnect />
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

      <PoweredBy />

      <SupportedBy />

      {/* Footer Links */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-[3rem]">
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Terms of Service
        </Link>
      </div>

      <ContactSupport />
    </div>
  );
}
