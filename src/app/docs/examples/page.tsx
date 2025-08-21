import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { Code, Zap, CheckCircle, AlertCircle } from 'lucide-react'

export default function ExamplesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Examples
          </Badge>
          <Badge variant="outline">Copy & Paste Ready</Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Code Examples</h1>
        <p className="text-xl text-muted-foreground">
          Working code examples for integrating Rozo Pay into your applications. 
          All examples are production-ready and include proper error handling.
        </p>
      </div>

      {/* Basic Pay Button Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle>Basic Pay Button</CardTitle>
          </div>
          <CardDescription>
            Simple payment button for accepting crypto payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`import { PayButton } from '@rozoai/intent-pay'

function ProductCheckout() {
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Premium Plan</h2>
      <p className="text-gray-600 mb-6">
        Unlock all features with our premium subscription
      </p>
      
      <div className="mb-4">
        <div className="text-2xl font-bold">$29.99</div>
        <div className="text-sm text-gray-500">per month</div>
      </div>

      <PayButton
        appId="pay-demo"
        intent="Purchase Premium Plan"
        toAddress="0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2"
        toChain={137} // Polygon
        toUnits="29.99"
        toToken="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // USDC
        externalId="premium-plan-user-123"
        paymentOptions={["card", "crypto"]}
        preferredChains={[1, 137, 42161]} // Ethereum, Polygon, Arbitrum
        closeOnSuccess={true}
        onPaymentStarted={(payment) => {
          console.log('Payment started:', payment.id)
          // Show loading state
        }}
        onPaymentCompleted={(payment) => {
          console.log('Payment completed!', payment)
          // Redirect to success page or update UI
          window.location.href = '/success?payment=' + payment.id
        }}
        onPaymentBounced={(error) => {
          console.error('Payment failed:', error)
          // Show error message to user
          alert('Payment failed. Please try again.')
        }}
      />
    </div>
  )
}

export default ProductCheckout`}
            language="typescript"
            title="ProductCheckout.tsx"
          />
        </CardContent>
      </Card>

      {/* Advanced Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <CardTitle>Advanced Configuration</CardTitle>
          </div>
          <CardDescription>
            PayButton with custom configuration and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`import { PayButton, getDefaultConfig } from '@rozoai/intent-pay'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Configure wagmi with Rozo Pay defaults
const config = getDefaultConfig({
  walletConnectProjectId: 'your-walletconnect-project-id',
  appName: 'Your App Name',
  appDescription: 'Your app description',
})

const queryClient = new QueryClient()

function AdvancedPaymentFlow() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
          
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Digital Product License</h3>
                <p className="text-sm text-gray-600">Lifetime access</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">$99.99</div>
                <div className="text-sm text-gray-500">One-time payment</div>
              </div>
            </div>

            <PayButton
              appId="your-app-id" // Replace with your actual app ID
              intent="Digital Product License Purchase"
              toAddress="0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2"
              toChain={137} // Polygon for lower fees
              toUnits="99.99"
              toToken="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // USDC
              
              // Advanced options
              externalId={\`license-\${Date.now()}\`}
              paymentOptions={["crypto", "card"]}
              preferredChains={[137, 42161, 10]} // Polygon, Arbitrum, Optimism
              preferredTokens={[
                { chain: 137, address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" }, // USDC on Polygon
                { chain: 42161, address: "0xA0b86a33E6441e6e80D0c4C6C7527d5B8D7B8B8B" }, // USDC on Arbitrum
              ]}
              
              // Metadata for tracking
              metadata={{
                productId: "digital-license-v1",
                userId: "user-12345",
                campaign: "holiday-sale",
                version: "1.0"
              }}
              
              // Redirect after payment
              redirectReturnUrl="https://yourapp.com/success"
              closeOnSuccess={false}
              resetOnSuccess={true}
              
              // Event handlers
              onOpen={() => {
                console.log('Payment modal opened')
                // Track analytics event
              }}
              
              onPaymentStarted={(payment) => {
                console.log('Payment started:', payment)
                // Update UI to show processing state
                // Send analytics event
              }}
              
              onPaymentCompleted={(payment) => {
                console.log('Payment completed:', payment)
                
                // Grant access to digital product
                grantProductAccess(payment.externalId, payment.id)
                
                // Send confirmation email
                sendConfirmationEmail(payment)
                
                // Track conversion
                trackConversion('license-purchase', payment.destination.amountUnits)
              }}
              
              onPaymentBounced={(error) => {
                console.error('Payment failed:', error)
                
                // Show user-friendly error message
                showErrorNotification('Payment failed. Please try again.')
                
                // Track failed payment for analytics
                trackFailedPayment(error)
              }}
              
              onClose={() => {
                console.log('Payment modal closed')
                // Track abandonment if payment not completed
              }}
            />
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Helper functions
async function grantProductAccess(externalId: string, paymentId: string) {
  // Your logic to grant product access
  await fetch('/api/grant-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ externalId, paymentId })
  })
}

function sendConfirmationEmail(payment: any) {
  // Send confirmation email
  console.log('Sending confirmation email for payment:', payment.id)
}

function trackConversion(event: string, amount: string) {
  // Track conversion in your analytics
  console.log('Conversion tracked:', event, amount)
}

function trackFailedPayment(error: any) {
  // Track failed payment
  console.log('Failed payment tracked:', error)
}

function showErrorNotification(message: string) {
  // Show error to user
  alert(message) // Replace with your notification system
}

export default AdvancedPaymentFlow`}
            language="typescript"
            title="AdvancedPaymentFlow.tsx"
          />
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <CardTitle>Error Handling</CardTitle>
          </div>
          <CardDescription>
            Robust error handling for production applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`import { IntentPayError } from '@rozoai/intent-pay'

async function handleBridgeWithErrors() {
  try {
    const quote = await client.getQuote(params)
    // ... bridge logic
  } catch (error) {
    if (error instanceof IntentPayError) {
      switch (error.code) {
        case 'INSUFFICIENT_BALANCE':
          showUserError('Not enough tokens for this bridge operation')
          break
          
        case 'ROUTE_NOT_AVAILABLE':
          showUserError('Bridge route not supported for this token pair')
          break
          
        case 'INVALID_CHAIN':
          showUserError('Unsupported blockchain network')
          break
          
        case 'RATE_LIMIT_EXCEEDED':
          showUserError('Too many requests. Please try again later.')
          // Implement exponential backoff
          setTimeout(() => retryOperation(), 5000)
          break
          
        case 'NETWORK_ERROR':
          showUserError('Network connection failed. Check your internet.')
          // Retry with exponential backoff
          break
          
        case 'QUOTE_EXPIRED':
          showUserError('Quote expired. Getting a new quote...')
          // Automatically get new quote
          await getNewQuote()
          break
          
        default:
          showUserError(\`Bridge error: \${error.message}\`)
          // Log to monitoring service
          logError(error)
      }
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error)
      showUserError('An unexpected error occurred')
      logError(error)
    }
  }
}

function showUserError(message: string) {
  // Show user-friendly error message
  toast.error(message)
}

function logError(error: Error) {
  // Log to your monitoring service (Sentry, etc.)
  console.error('Bridge error:', error)
}`}
            language="typescript"
            title="error-handling.ts"
          />
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <CardTitle>Best Practices</CardTitle>
          </div>
          <CardDescription>
            Production tips for building robust bridge applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Do</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Always validate user inputs before API calls</li>
                <li>• Show users estimated fees and completion times</li>
                <li>• Implement proper loading states and progress indicators</li>
                <li>• Store intent IDs for status tracking</li>
                <li>• Use exponential backoff for retries</li>
                <li>• Implement proper error boundaries in React</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Don&apos;t</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Don&apos;t submit bridges without user confirmation</li>
                <li>• Don&apos;t ignore quote expiration times</li>
                <li>• Don&apos;t poll status more frequently than every 10 seconds</li>
                <li>• Don&apos;t hardcode token addresses or chain IDs</li>
                <li>• Don&apos;t forget to handle network timeouts</li>
                <li>• Don&apos;t expose private keys in client-side code</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
