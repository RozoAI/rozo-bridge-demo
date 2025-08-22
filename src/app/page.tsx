import { Bridge } from "@/components/Bridge";
import { RozoWalletSelector } from "@/components/RozoWalletSelector"; // Updated import
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/rozo-logo.png"
                alt="Rozo Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold">Rozo Bridge</h1>
                <p className="text-sm text-muted-foreground">Multi-chain USDC transfers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-sm hover:text-foreground transition-colors text-muted-foreground">
                Documentation
              </Link>
              <RozoWalletSelector />
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Powered by</div>
                <div className="text-sm font-semibold">Intent Pay</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Intent-Based USDC Transfers
            </h2>
            <p className="text-muted-foreground mb-6">
              Experience seamless cross-chain USDC transfers with intent-based execution. 
              Powered by @rozoai/intent-pay for optimal routing and execution.
            </p>
            <div className="mt-2 flex justify-center">
              <Link href="/docs">
                <Button className="gap-2" size="sm">
                  Documentation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Bridge Component */}
          <Bridge />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                🎯
              </div>
              <h3 className="font-semibold mb-2">Intent-Based</h3>
              <p className="text-sm text-muted-foreground">
                Express your transfer intent and let the system find optimal execution
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                💰
              </div>
              <h3 className="font-semibold mb-2">No Commission</h3>
              <p className="text-sm text-muted-foreground">
                Zero commission fees - only pay for gas and protocol fees
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                🔄
              </div>
              <h3 className="font-semibold mb-2">Payin/Payout</h3>
              <p className="text-sm text-muted-foreground">
                Clear separation of payin and payout flows for better UX
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>© 2024 Rozo Intent Pay Demo. Powered by @rozoai/intent-pay</div>
            <div className="flex items-center gap-4">
              <a href="https://www.npmjs.com/package/@rozoai/intent-pay" className="hover:text-foreground transition-colors">
                NPM Package
              </a>
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <a href="https://github.com/RozoAI/intent-pay" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
