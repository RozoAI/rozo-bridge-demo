import { NewBridge } from "@/components/NewBridge";
import Image from "next/image";
import Link from "next/link";

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
                <h1 className="text-xl font-bold">ROZO Bridge</h1>
                <p className="text-sm text-muted-foreground">
                  Any chain. Any stablecoin. Seconds.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.npmjs.com/package/@rozoai/intent-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-foreground transition-colors text-muted-foreground"
              >
                NPM Package
              </Link>

              <Link
                href="/docs"
                className="text-sm hover:text-foreground transition-colors text-muted-foreground"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Bridge Component */}

          <NewBridge />

          <div className="mt-10 flex flex-col items-center">
            <span className="text-sm text-muted-foreground mb-3">
              Supported by
            </span>
            <div className="flex gap-6 items-center">
              <div className="flex">
                <a
                  href="https://partners.circle.com/partner/rozo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/circle.svg"
                    alt="Circle"
                    className="h-20 w-auto m-auto"
                  />
                </a>
              </div>
              <div className="flex">
                <a
                  href="https://www.coinbase.com/developer-platform/discover/launches/summer-builder-grants"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/base.svg"
                    alt="Base"
                    className="h-5 w-auto m-auto"
                  />
                </a>
              </div>
              <div className="flex flex-col items-center">
                <a
                  href="https://x.com/i/broadcasts/1djGXWBqdVdKZ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/scf.svg"
                    alt="Stellar"
                    className="h-9 w-auto mb-1"
                  />
                </a>
              </div>
              <div className="flex flex-col items-center">
                <a
                  href="https://draperuniversity.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/draper.svg"
                    alt="Draper University"
                    className="h-14 w-auto mb-1"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Features */}
          {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                🎯
              </div>
              <h3 className="font-semibold mb-2">Any Chain</h3>
              <p className="text-sm text-muted-foreground">
                Cross-chain transfers
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                💰
              </div>
              <h3 className="font-semibold mb-2">Any Stablecoin</h3>
              <p className="text-sm text-muted-foreground">
                USDC, USDT, DAI and more
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                🔄
              </div>
              <h3 className="font-semibold mb-2">Seconds</h3>
              <p className="text-sm text-muted-foreground">
                Lightning fast transfers
              </p>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
