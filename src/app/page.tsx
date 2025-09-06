import { Bridge } from "@/components/Bridge";
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
{/*              <RozoWalletSelector />
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Powered by</div>
                <div className="text-sm font-semibold">Rozo</div>
              </div>*/}
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
              Built for real-life micropayments. Fees are waived if a transaction takes longer than 10 seconds. Contact us for production use.
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
              <h3 className="font-semibold mb-2">Instant Transfer</h3>
              <p className="text-sm text-muted-foreground">
                Within 5 seconds
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                💰
              </div>
              <h3 className="font-semibold mb-2">Frictionless</h3>
              <p className="text-sm text-muted-foreground">
                Limited-Time Free (0.1% Fee Waived)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                🔄
              </div>
              <h3 className="font-semibold mb-2">Intent-Based</h3>
              <p className="text-sm text-muted-foreground">
                One Tap to Pay
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center gap-8">
            {/* Contact Us - Centered and Larger */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
              <div className="flex gap-6">
                <a 
                  href="https://x.com/rozoai" 
                  className="hover:text-foreground transition-all hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://discord.com/invite/EfWejgTbuU" 
                  className="hover:text-foreground transition-all hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                <a 
                  href="https://api.whatsapp.com/send/?phone=14088925415&text=Hi%2C+I%27d+like+to+contact+you+about+your+services.&type=phone_number&app_absent=0" 
                  className="hover:text-foreground transition-all hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/shawnmuggle" 
                  className="hover:text-foreground transition-all hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21l-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85l5.18-4.68c.223-.198-.054-.308-.346-.111l-6.4 4.02l-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.94.107.78.88z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Resources - Below Contact */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
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
