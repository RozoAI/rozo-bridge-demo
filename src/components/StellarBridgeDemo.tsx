'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Wallet } from 'lucide-react'
import { StellarWalletConnect } from './StellarWalletConnect'
import { StellarAddressInput } from './StellarAddressInput'
import { StellarMemoInput } from './StellarMemoInput'
import { useStellarWalletConnection } from '@/store/stellar'
// Define MemoType enum locally to avoid dependency issues
enum MemoType {
  MemoNone = 0,
  MemoText = 1,
  MemoId = 2,
  MemoHash = 3,
  MemoReturn = 4,
}

export function StellarBridgeDemo() {
  const [destinationAddress, setDestinationAddress] = useState('')
  const [memo, setMemo] = useState<{ type: MemoType; value: string } | null>(null)
  const [amount, setAmount] = useState('')
  
  const { isConnected, publicKey, network } = useStellarWalletConnection()

  const handleTransfer = async () => {
    if (!isConnected || !destinationAddress || !amount) {
      return
    }

    console.log('Stellar Transfer:', {
      from: publicKey,
      to: destinationAddress,
      amount,
      memo,
      network,
    })

    // Here you would integrate with your bridge logic
    // For example, using the Stellar SDK to create and sign transactions
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-purple-500" />
          Stellar Bridge Demo
        </h2>
        <p className="text-muted-foreground">
          Complete Stellar wallet integration with memo validation and muxed address support
        </p>
      </div>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stellar Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Connect your Stellar wallet to start transfers
              </p>
              {isConnected && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</p>
                  <Badge variant="outline" className="text-xs">
                    {network === 'PUBLIC' ? 'Mainnet' : 'Testnet'}
                  </Badge>
                </div>
              )}
            </div>
            <StellarWalletConnect />
          </div>

          {/* Supported Wallets Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Supported Wallets:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>🚀</span>
                <span>Freighter (Extension)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🐂</span>
                <span>xBull (Extension/Web)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📱</span>
                <span>LOBSTR (Mobile via WC)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Stellar Transfer</CardTitle>
            <p className="text-sm text-muted-foreground">
              Send assets with automatic memo validation and muxed address support
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (XLM)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-md"
                step="0.0000001"
                min="0"
              />
            </div>

            <Separator />

            {/* Destination Address */}
            <StellarAddressInput
              value={destinationAddress}
              onChange={setDestinationAddress}
              label="Destination Address"
              placeholder="Enter Stellar address (G... or M...)"
              required
            />

            <Separator />

            {/* Memo Input */}
            <StellarMemoInput
              destinationAddress={destinationAddress}
              memo={memo}
              onMemoChange={setMemo}
            />

            <Separator />

            {/* Transfer Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-medium">Transfer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-mono">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono">
                    {destinationAddress ? `${destinationAddress.slice(0, 8)}...${destinationAddress.slice(-8)}` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>{amount || '0'} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{network === 'PUBLIC' ? 'Mainnet' : 'Testnet'}</span>
                </div>
                {memo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memo:</span>
                    <span className="font-mono text-xs">
                      {memo.type === MemoType.MemoText && 'TEXT: '}
                      {memo.type === MemoType.MemoId && 'ID: '}
                      {memo.type === MemoType.MemoHash && 'HASH: '}
                      {memo.value}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Button */}
            <Button
              onClick={handleTransfer}
              disabled={!destinationAddress || !amount || parseFloat(amount) <= 0}
              className="w-full"
              size="lg"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Send Stellar Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Implemented</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Stellar Wallet Kit integration</li>
                <li>• Freighter wallet support</li>
                <li>• xBull wallet support</li>
                <li>• WalletConnect for mobile wallets</li>
                <li>• SEP-29 memo required validation</li>
                <li>• Muxed address (M...) support</li>
                <li>• Address normalization</li>
                <li>• Multi-namespace WalletConnect</li>
                <li>• EVM + Stellar dual support</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🔧 Configuration</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CAIP-2 chain IDs (stellar:pubnet, stellar:testnet)</li>
                <li>• Official Stellar RPC methods</li>
                <li>• stellar_signXDR & stellar_signAndSubmitXDR</li>
                <li>• Automatic session restoration</li>
                <li>• Network switching support</li>
                <li>• Error handling & validation</li>
                <li>• TypeScript integration</li>
                <li>• Zustand state management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
