import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { ApiEndpoint } from '@/components/docs/ApiEndpoint'

export default function ApiOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">REST API Reference</h1>
        <p className="text-xl text-muted-foreground">
          Complete REST API documentation for Rozo Pay. Create payments, track status, and manage webhooks.
        </p>
      </div>

      {/* Base URL & Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL & Authentication</CardTitle>
          <CardDescription>API endpoint and authentication requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Base URL</h4>
            <CodeBlock 
              code="https://intentapiv2.rozo.ai/"
              language="text"
              title="Production API Base URL"
            />
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Include your API key in the Api-Key header for all requests.
            </p>
            <CodeBlock 
              code={`curl -H "Api-Key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://intentapiv2.rozo.ai/api/payment`}
              language="bash"
              title="Authentication Example"
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Idempotency</h4>
            <p className="text-sm text-muted-foreground mb-3">
              For write operations, include an Idempotency-Key header to prevent duplicate requests.
            </p>
            <CodeBlock 
              code={`curl -H "Api-Key: YOUR_API_KEY" \\
     -H "Idempotency-Key: unique-request-id-123" \\
     -H "Content-Type: application/json" \\
     https://intentapiv2.rozo.ai/api/payment`}
              language="bash"
              title="Idempotency Example"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments API */}
      <ApiEndpoint
        method="POST"
        path="/api/payment"
        title="Create Payment"
        description="Creates a payment and returns a hosted checkout URL and payment object."
        requestBody={{
          type: "application/json",
          example: `{
  "display": {
    "intent": "Purchase Premium Plan",
    "orgLogo": "https://yourapp.com/logo.png",
    "items": [
      {
        "name": "Premium Plan",
        "description": "Monthly subscription",
        "price": "29.99",
        "priceDetails": "USD per month"
      }
    ],
    "preferredChains": [1, 137, 42161],
    "preferredTokens": [
      { "chain": 1, "address": "0xA0b86a33E6441e6e80D0c4C6C7527d5B8D7B8B8B" }
    ],
    "paymentOptions": ["card", "crypto"],
    "redirectUri": "https://yourapp.com/success"
  },
  "destination": {
    "destinationAddress": "0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2",
    "chainId": 137,
    "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "amountUnits": "29990000",
    "calldata": "0x"
  },
  "refundAddress": "0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2",
  "externalId": "order-12345",
  "metadata": {
    "userId": "user-789",
    "planType": "premium"
  }
}`
        }}
        responses={[
          {
            status: 200,
            description: "Payment created successfully",
            example: `{
  "id": "pay_1234567890abcdef",
  "url": "https://intentapiv2.rozo.ai/checkout/pay_1234567890abcdef",
  "payment": {
    "id": "pay_1234567890abcdef",
    "status": "payment_unpaid",
    "createdAt": "1704067200",
    "display": {
      "intent": "Purchase Premium Plan",
      "paymentValue": "29.99",
      "currency": "USD"
    },
    "source": null,
    "destination": {
      "destinationAddress": "0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2",
      "txHash": null,
      "chainId": "137",
      "amountUnits": "29990000",
      "tokenSymbol": "USDC",
      "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "callData": "0x"
    },
    "externalId": "order-12345",
    "metadata": {
      "userId": "user-789",
      "planType": "premium"
    }
  }
}`
          }
        ]}
      />

      <ApiEndpoint
        method="GET"
        path="/api/payment/{id}"
        title="Get Payment by ID"
        description="Retrieve a payment by its ID."
        parameters={[
          {
            name: "id",
            type: "string",
            required: true,
            description: "The payment ID"
          }
        ]}
        responses={[
          {
            status: 200,
            description: "Payment object",
            example: `{
  "id": "pay_1234567890abcdef",
  "status": "payment_completed",
  "createdAt": "1704067200",
  "display": {
    "intent": "Purchase Premium Plan",
    "paymentValue": "29.99",
    "currency": "USD"
  },
  "source": {
    "payerAddress": "0x8ba1f109551bD432803012645Hac136c22C501e",
    "txHash": "0xabc123...",
    "chainId": "1",
    "amountUnits": "30000000",
    "tokenSymbol": "USDC",
    "tokenAddress": "0xA0b86a33E6441e6e80D0c4C6C7527d5B8D7B8B8B"
  },
  "destination": {
    "destinationAddress": "0x742d35Cc6634C0532925a3b8D8Cf3e5e7C8e7c2",
    "txHash": "0xdef456...",
    "chainId": "137",
    "amountUnits": "29990000",
    "tokenSymbol": "USDC",
    "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "callData": "0x"
  },
  "externalId": "order-12345",
  "metadata": {
    "userId": "user-789",
    "planType": "premium"
  }
}`
          }
        ]}
      />

      <ApiEndpoint
        method="GET"
        path="/api/payment/external-id/{externalId}"
        title="Get Payment by External ID"
        description="Retrieve a payment by your external ID."
        parameters={[
          {
            name: "externalId",
            type: "string",
            required: true,
            description: "Your external ID for the payment"
          }
        ]}
        responses={[
          {
            status: 200,
            description: "Payment object (same structure as above)"
          }
        ]}
      />

      {/* Webhooks API */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Webhooks API</h2>
        
        <ApiEndpoint
          method="POST"
          path="/api/webhook"
          title="Create Webhook"
          description="Register a webhook URL to receive payment events."
          requestBody={{
            type: "application/json",
            example: `{
  "url": "https://yourapp.com/webhooks/rozo-pay"
}`
          }}
          responses={[
            {
              status: 200,
              description: "Webhook created",
              example: `{
  "id": "wh_1234567890abcdef",
  "url": "https://yourapp.com/webhooks/rozo-pay",
  "token": "whsec_1234567890abcdef..."
}`
            }
          ]}
        />

        <ApiEndpoint
          method="GET"
          path="/api/webhook/{id}"
          title="Get Webhook"
          description="Retrieve webhook details by ID."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The webhook ID"
            }
          ]}
          responses={[
            {
              status: 200,
              description: "Webhook details",
              example: `{
  "id": "wh_1234567890abcdef",
  "url": "https://yourapp.com/webhooks/rozo-pay",
  "token": "whsec_1234567890abcdef..."
}`
            }
          ]}
        />

        <ApiEndpoint
          method="DELETE"
          path="/api/webhook/{id}"
          title="Delete Webhook"
          description="Delete a webhook by ID."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The webhook ID"
            }
          ]}
          responses={[
            {
              status: 200,
              description: "Webhook deleted",
              example: `{
  "status": "success"
}`
            }
          ]}
        />
      </div>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Values</CardTitle>
          <CardDescription>Understanding payment lifecycle states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { status: 'payment_unpaid', description: 'Payment created but not yet started' },
              { status: 'payment_started', description: 'User has initiated payment' },
              { status: 'payment_completed', description: 'Payment successfully completed' },
              { status: 'payment_bounced', description: 'Payment failed or was rejected' }
            ].map((item) => (
              <div key={item.status} className="flex gap-3 p-3 border rounded">
                <Badge variant="outline" className="font-mono text-xs">
                  {item.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}