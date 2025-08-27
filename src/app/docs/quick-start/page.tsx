import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { Zap, Package, Code } from 'lucide-react'

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            5 Seconds
          </Badge>
          <Badge variant="outline">Beginner Friendly</Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground">
          Bridge with Rozo within 5 seconds. This guide will walk you through 
          creating your first cross-chain bridge application.
        </p>
      </div>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>What you&apos;ll need before getting started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Required</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Node.js 18+ installed</li>
                <li>• Basic JavaScript/TypeScript knowledge</li>
                <li>• Web3 wallet (MetaMask, WalletConnect, etc.)</li>
                <li>• Some USDC for testing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Recommended</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• React or Next.js experience</li>
                <li>• Understanding of blockchain basics</li>
                <li>• Familiarity with ethers.js or viem</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Installation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <CardTitle>Install the SDK</CardTitle>
            </div>
          </div>
          <CardDescription>Add Intent Pay SDK to your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock 
            code="npm install @rozoai/intent-pay"
            language="bash"
            title="Install via npm"
          />
          
          <div className="text-sm text-muted-foreground">
            <p>Or using yarn:</p>
          </div>
          
          <CodeBlock 
            code="yarn add @rozoai/intent-pay"
            language="bash"
            title="Install via yarn"
          />
        </CardContent>
      </Card>

      {/* Step 2: Basic Setup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              <CardTitle>Initialize the Client</CardTitle>
            </div>
          </div>
          <CardDescription>Set up the Intent Pay client in your application</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`import { IntentPayClient } from '@rozoai/intent-pay'

// Initialize the client
const client = new IntentPayClient({
  network: 'mainnet', // or 'testnet' for testing
  apiKey: 'your-api-key' // Optional for client-side usage
})

// Check if the client is ready
console.log('Intent Pay client initialized successfully!')`}
            language="typescript"
            title="client.ts"
          />
        </CardContent>
      </Card>

      {/* Step 3: Your First Bridge */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <CardTitle>Create Your First Bridge</CardTitle>
            </div>
          </div>
          <CardDescription>Bridge USDC from Ethereum to Polygon</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`import { IntentPayClient } from '@rozoai/intent-pay'
import { ethers } from 'ethers'

async function bridgeToPolygon() {
  const client = new IntentPayClient({ network: 'mainnet' })
  
  // Your wallet address
  const walletAddress = '0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2'
  
  // Bridge parameters
  const bridgeParams = {
    fromChainId: 1, // Ethereum
    toChainId: 137, // Polygon
    token: '0xA0b86a33E6441e6e80D0c4C6C7527d5B8D7B8B8B', // USDC on Ethereum
    amount: ethers.parseUnits('10', 6), // 10 USDC
    from: walletAddress,
    to: walletAddress // Same address on destination
  }

  try {
    // Step 1: Get a quote
    console.log('Getting bridge quote...')
    const quote = await client.getQuote(bridgeParams)
    
    console.log(\`Bridge fee: \${ethers.formatUnits(quote.fees.total, 6)} USDC\`)
    console.log(\`You'll receive: \${ethers.formatUnits(quote.estimatedOutput, 6)} USDC\`)
    console.log(\`Estimated time: \${quote.estimatedTime}\`)

    // Step 2: Submit the bridge (requires wallet connection)
    // const result = await client.submitBridge({
    //   quoteId: quote.id,
    //   signer: yourWalletSigner
    // })
    
    // console.log('Bridge submitted!', result.intentId)
    
  } catch (error) {
    console.error('Bridge failed:', error.message)
  }
}

// Run the bridge
bridgeToPolygon()`}
            language="typescript"
            title="bridge-example.ts"
          />
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>🎉 What&apos;s Next?</CardTitle>
          <CardDescription>
            You&apos;re ready to build! Explore these resources to go deeper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/sdk" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-semibold mb-2">📦 SDK Guide</h4>
              <p className="text-sm text-muted-foreground">
                Complete TypeScript SDK documentation
              </p>
            </Link>
            
            <Link href="/docs/examples" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-semibold mb-2">💻 Code Examples</h4>
              <p className="text-sm text-muted-foreground">
                Working examples and React integration
              </p>
            </Link>
            
            <Link href="/docs/api" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-semibold mb-2">🔌 REST API</h4>
              <p className="text-sm text-muted-foreground">
                Complete API reference for server-side usage
              </p>
            </Link>
            
            <a href="https://www.npmjs.com/package/@rozoai/intent-pay" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-semibold mb-2">📋 NPM Package</h4>
              <p className="text-sm text-muted-foreground">
                View package details and changelog
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}