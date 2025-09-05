import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Code, Globe, Shield, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import packageJson from "../../../package.json";

export default function DocsHomePage() {
  const intentPayVersion =
    packageJson.dependencies["@rozoai/intent-pay"]?.replace("^", "") ||
    "Unknown";

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/rozo-logo.png"
            alt="Rozo Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              v{intentPayVersion}
            </Badge>
            <Badge variant="outline">Latest</Badge>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Rozo Bridge Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Build seamless cross-chain applications with Intent Pay. Bridge USDC
          across multiple blockchains with our powerful API and SDK — fast,
          secure, and developer-friendly. Uses local optimized chain/token logos
          with a globe fallback for unknown networks.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle>Quick Start</CardTitle>
            </div>
            <CardDescription>Bridge with Rozo within 5 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/docs/quick-start">
              <Button className="w-full group">
                Start Building
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <CardTitle>SDK Reference</CardTitle>
            </div>
            <CardDescription>
              Complete TypeScript SDK documentation and examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/docs/sdk">
              <Button variant="outline" className="w-full group">
                View SDK Docs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Why Choose Rozo Bridge?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Optimized intent-based bridging with minimal confirmation times
                and competitive fees.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Battle-tested smart contracts with comprehensive security audits
                and insurance coverage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Multi-Chain Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bridge USDC across Ethereum, Polygon, Arbitrum, Optimism, and
                more chains.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Get Started in 3 Steps</h2>
        <div className="space-y-4">
          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Install the SDK</h3>
              <p className="text-muted-foreground mb-2">
                Add @rozoai/intent-pay to your project
              </p>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                npm install @rozoai/intent-pay
              </code>
            </div>
          </div>

          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Configure Your App</h3>
              <p className="text-muted-foreground mb-2">
                Set up the Intent Pay client with your configuration
              </p>
              <Link
                href="/docs/sdk/config"
                className="text-primary hover:underline text-sm"
              >
                View configuration guide →
              </Link>
            </div>
          </div>

          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Start Bridging</h3>
              <p className="text-muted-foreground mb-2">
                Use our simple API to bridge tokens across chains
              </p>
              <Link
                href="/docs/examples"
                className="text-primary hover:underline text-sm"
              >
                See examples →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Documentation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/docs/api"
            className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-2">🔌 REST API</h3>
            <p className="text-sm text-muted-foreground">
              Complete API documentation with examples
            </p>
          </Link>

          <Link
            href="/docs/sdk"
            className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-2">📦 TypeScript SDK</h3>
            <p className="text-sm text-muted-foreground">
              Intent Pay SDK guide and reference
            </p>
          </Link>

          <Link
            href="/docs/examples"
            className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-2">💻 Code Examples</h3>
            <p className="text-sm text-muted-foreground">
              Working implementations and tutorials
            </p>
          </Link>

          <Link
            href="/docs/quick-start"
            className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-2">⚡ Quick Start</h3>
            <p className="text-sm text-muted-foreground">Bridge in 5 seconds</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
