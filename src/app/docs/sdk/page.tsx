import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { Package, Zap, Shield, Code } from 'lucide-react'

export default function SdkOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            @rozoai/intent-pay
          </Badge>
          <Badge variant="outline">v0.0.18-beta.9</Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Rozo Pay SDK</h1>
        <p className="text-xl text-muted-foreground">
          The official TypeScript SDK for Rozo Pay. Accept crypto payments with React components,
          hooks, and a complete payment flow - forked from Daimo&apos;s stable SDK.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle>Quick Start</CardTitle>
          </div>
          <CardDescription>Get started with Intent Pay SDK in under 2 minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Installation</h4>
            <CodeBlock 
              code="npm install @rozoai/intent-pay"
              language="bash"
              title="Install via npm"
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Basic Usage</h4>
            <CodeBlock 
              code={`import { PayButton } from '@rozoai/intent-pay'

// Basic Pay Button
function CheckoutPage() {
  return (
    <PayButton
      appId="pay-demo"
      intent="Purchase Premium Plan"
      toAddress="0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2"
      toChain={137} // Polygon
      toUnits="29.99"
      toToken="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // USDC
      onPaymentCompleted={(payment) => {
        console.log('Payment completed!', payment)
        // Redirect to success page
      }}
      onPaymentBounced={(error) => {
        console.error('Payment failed:', error)
      }}
    />
  )
}`}
              language="typescript"
              title="Basic Pay Button"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Package className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">TypeScript First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Full TypeScript support with comprehensive type definitions, 
                auto-completion, and compile-time error checking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Async/Await Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modern Promise-based API with full async/await support. 
                No callbacks, just clean, readable code.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Error Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive error types with detailed error messages 
                and recovery suggestions for robust applications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Framework Agnostic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Works with React, Vue, Angular, Node.js, or vanilla JavaScript. 
                Use it anywhere JavaScript runs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PayButton Props */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">PayButton Props</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Properties</CardTitle>
            <CardDescription>Essential props for the PayButton component</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                {[
                  { 
                    prop: 'appId', 
                    type: 'string',
                    required: true,
                    description: 'Your app identifier (use "pay-demo" for prototyping)'
                  },
                  { 
                    prop: 'intent', 
                    type: 'string',
                    required: true,
                    description: 'Description of what the payment is for'
                  },
                  { 
                    prop: 'toAddress', 
                    type: 'string',
                    required: true,
                    description: 'Destination wallet address'
                  },
                  { 
                    prop: 'toChain', 
                    type: 'number',
                    required: true,
                    description: 'EVM chain ID (e.g., 1 for Ethereum, 137 for Polygon)'
                  },
                  { 
                    prop: 'toUnits', 
                    type: 'string',
                    required: true,
                    description: 'Exact amount as decimal string (e.g., "29.99")'
                  },
                  { 
                    prop: 'toToken', 
                    type: 'string',
                    required: true,
                    description: 'ERC-20 address or zero-address for native token'
                  },
                  { 
                    prop: 'paymentOptions', 
                    type: 'string[]',
                    required: false,
                    description: 'Preferred payment methods (e.g., ["card", "crypto"])'
                  },
                  { 
                    prop: 'preferredChains', 
                    type: 'number[]',
                    required: false,
                    description: 'Preferred source chains for payment'
                  },
                  { 
                    prop: 'externalId', 
                    type: 'string',
                    required: false,
                    description: 'Your unique identifier for this payment'
                  },
                  { 
                    prop: 'closeOnSuccess', 
                    type: 'boolean',
                    required: false,
                    description: 'Auto-close modal after successful payment'
                  }
                ].map((item) => (
                  <div key={item.prop} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-semibold text-primary">{item.prop}</code>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        <Badge variant={item.required ? 'destructive' : 'secondary'} className="text-xs">
                          {item.required ? 'required' : 'optional'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Handlers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Event Handlers</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Events</CardTitle>
            <CardDescription>Handle payment lifecycle events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                { 
                  event: 'onPaymentStarted', 
                  description: 'Called when user initiates payment',
                  payload: 'Payment object with initial status'
                },
                { 
                  event: 'onPaymentCompleted', 
                  description: 'Called when payment is successfully completed',
                  payload: 'Complete Payment object with transaction details'
                },
                { 
                  event: 'onPaymentBounced', 
                  description: 'Called when payment fails or is rejected',
                  payload: 'Error object with failure details'
                },
                { 
                  event: 'onOpen', 
                  description: 'Called when payment modal opens',
                  payload: 'Modal state'
                },
                { 
                  event: 'onClose', 
                  description: 'Called when payment modal closes',
                  payload: 'Modal state'
                }
              ].map((item) => (
                <div key={item.event} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-semibold text-primary">{item.event}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground">Payload: {item.payload}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Handling */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Error Handling</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Error Codes</CardTitle>
            <CardDescription>Handle these errors gracefully in your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { code: 'INSUFFICIENT_BALANCE', description: 'User does not have enough tokens' },
                { code: 'ROUTE_NOT_AVAILABLE', description: 'No bridge route available for token pair' },
                { code: 'INVALID_CHAIN', description: 'Unsupported or invalid chain ID' },
                { code: 'ALLOWANCE_REQUIRED', description: 'Token approval needed before bridge' },
                { code: 'QUOTE_EXPIRED', description: 'Quote is no longer valid' },
                { code: 'NETWORK_ERROR', description: 'Network connection or RPC error' }
              ].map((error) => (
                <div key={error.code} className="flex gap-3 p-3 border rounded">
                  <Badge variant="outline" className="font-mono text-xs">
                    {error.code}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{error.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/docs/examples" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
            <h3 className="font-semibold mb-2">💻 Code Examples</h3>
            <p className="text-sm text-muted-foreground">Working implementations and React hooks</p>
          </Link>
          
          <Link href="/docs/api" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
            <h3 className="font-semibold mb-2">🔌 REST API</h3>
            <p className="text-sm text-muted-foreground">Server-side API documentation</p>
          </Link>
          
          <a href="https://www.npmjs.com/package/@rozoai/intent-pay" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
            <h3 className="font-semibold mb-2">📦 NPM Package</h3>
            <p className="text-sm text-muted-foreground">Package details and changelog</p>
          </a>
          
          <a href="https://github.com/RozoAI/api-proxy" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:border-primary/50 transition-colors">
            <h3 className="font-semibold mb-2">🔧 API Repository</h3>
            <p className="text-sm text-muted-foreground">Source code and issues</p>
          </a>
        </div>
      </div>
    </div>
  )
}