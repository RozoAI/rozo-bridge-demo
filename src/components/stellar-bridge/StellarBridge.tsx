"use client";

import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PoweredBy } from "../PoweredBy";
import { StellarWalletConnect } from "../StellarWalletConnect";
import { StellarDeposit } from "./StellarDeposit";
import { StellarWithdraw } from "./StellarWithdraw";

type FlowType = "deposit" | "withdraw";

export function StellarBridge() {
  const [flowType, setFlowType] = useState<FlowType>("deposit");
  const [destinationStellarAddress, setDestinationStellarAddress] =
    useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    setAmount("");
    setCustomAmount("");
  }, [flowType]);

  return (
    <div className="min-h-screen flex flex-col py-8 px-8">
      {/* Header */}
      <div className="container mx-auto flex items-start justify-between h-min mb-8">
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

      {/* Fixed Tab List - Truly Fixed Position */}
      <div className="sticky top-8 z-10 flex w-full justify-center mb-6 bg-background/80 backdrop-blur-sm">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid grid-cols-2">
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              flowType === "deposit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFlowType("deposit")}
          >
            <ArrowUpRight className="size-3 mr-1" />
            Deposit from any chains
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              flowType === "withdraw"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFlowType("withdraw")}
          >
            <ArrowDownLeft className="size-3 mr-1" />
            Withdraw to Base
          </button>
        </div>
      </div>

      {/* Content Area - More Responsive Width */}
      <div className="flex w-full flex-1">
        <div className="mx-auto w-full max-w-2xl px-4">
          {flowType === "deposit" ? (
            <StellarDeposit
              destinationStellarAddress={destinationStellarAddress}
              onDestinationAddressChange={setDestinationStellarAddress}
            />
          ) : (
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
          )}
        </div>
      </div>

      {/* Footer - Fixed at Bottom */}
      <div className="container mx-auto w-full mt-auto">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 py-6">
          <div className="flex flex-row items-center gap-4">
            <Link
              href="/faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
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
                  className="h-4 w-auto transition-opacity group-hover:opacity-80"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Stellar Community Fund
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
                  className="h-4 w-auto transition-opacity group-hover:opacity-80"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Base - Coinbase&apos;s L2 Network
                </div>
              </a>
            </div>
            <div className="flex">
              <a
                href="https://x.com/draper_u/status/1940908242412183926"
                target="_blank"
                rel="noopener noreferrer"
                title="Draper University - Entrepreneurship Program"
                className="group relative"
              >
                <img
                  src="/draper.webp"
                  alt="Draper University"
                  className="h-4 w-auto transition-opacity group-hover:opacity-80"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Draper University - Entrepreneurship Program
                </div>
              </a>
            </div>
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
                  className="h-4 w-auto transition-opacity group-hover:opacity-80"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Circle - USDC Issuer & Partner
                </div>
              </a>
            </div>
            <a
              href="https://discord.com/invite/EfWejgTbuU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <a
              href="https://x.com/rozoai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                ></path>
              </svg>
            </a>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          <PoweredBy />
        </div>

        {/* <SupportedBy /> */}
      </div>
    </div>
  );
}
