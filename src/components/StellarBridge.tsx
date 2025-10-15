"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ContactSupport } from "./ContactSupport";
import { StellarDeposit } from "./stellar-bridge/StellarDeposit";
import { StellarWithdraw } from "./stellar-bridge/StellarWithdraw";
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
          <TabsTrigger value="deposit">
            <ArrowUpRight className="size-5 mr-1.5" />
            Deposit from any chains
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowDownLeft className="size-5 mr-1.5" />
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
