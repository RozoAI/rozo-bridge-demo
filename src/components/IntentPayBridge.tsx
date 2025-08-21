'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Zap, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { ChainSelect } from './ChainSelect'
import { AddressInput } from './AddressInput'
import { StellarAddressInput } from './StellarAddressInput'
import { StellarMemoInput } from './StellarMemoInput'
import { UnifiedWalletConnect } from './UnifiedWalletConnect'
import { RozoPayButton } from '@rozoai/intent-pay'
import { 
  createIntentConfig, 
  isRouteSupported,
  DEFAULT_INTENT_PAY_CONFIG 
} from '@/lib/intentPay'
import { useAccount } from 'wagmi'
import { useStellarWalletConnection } from '@/store/stellar'
import { isValidStellarAddress } from '@/lib/stellar'
import { toast } from 'sonner'

// Define MemoType enum locally to avoid dependency issues
enum MemoType {
  MemoNone = 0,
  MemoText = 1,
  MemoId = 2,
  MemoHash = 3,
  MemoReturn = 4,
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function IntentPayBridge() {
  const MIN_USDC_AMOUNT = 0.10
  const [fromChainId, setFromChainId] = useState<number>(1) // Ethereum
  const [toChainId, setToChainId] = useState<number>(8453) // Base
  const [amount, setAmount] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [toStellarAddress, setToStellarAddress] = useState('')
  const [memo, setMemo] = useState<{ type: MemoType; value: string } | null>(null)
  
  const { isConnected: evmConnected, address: evmAddress } = useAccount()
  const { isConnected: stellarConnected, publicKey: stellarAddress } = useStellarWalletConnection()

  // Unified selection flags
  const isDestStellar = toChainId === 1500 || toChainId === 1501

  // Validate form
  const isFormValid = () => {
    if (!amount || parseFloat(amount) <= 0) return false
    if (!Number.isFinite(parseFloat(amount))) return false
    if (parseFloat(amount) < MIN_USDC_AMOUNT) return false
    if (!isRouteSupported(fromChainId, toChainId)) return false
    if (isDestStellar) {
      return !!toStellarAddress && isValidStellarAddress(toStellarAddress)
    }
    return !!toAddress
  }

  // Create Intent Pay configuration
  const getIntentConfig = () => {
    if (!isFormValid()) return null
    if (isDestStellar) {
      return createIntentConfig({
        appId: DEFAULT_INTENT_PAY_CONFIG.appId,
        fromChainId,
        toStellarAddress,
        amount,
        memo: memo ? {
          type: memo.type === MemoType.MemoText ? 'text' :
                memo.type === MemoType.MemoId ? 'id' : 'hash',
          value: memo.value
        } : undefined,
        externalId: `stellar-bridge-${Date.now()}`,
      })
    }
    return createIntentConfig({
      appId: DEFAULT_INTENT_PAY_CONFIG.appId,
      fromChainId,
      toChainId,
      toAddress: toAddress as `0x${string}`,
      amount,
      externalId: `bridge-${Date.now()}`,
    })
  }

  const handlePaymentStarted = () => {
    toast.success('Payment initiated! No gas fees required.')
  }

  const handlePaymentCompleted = () => {
    toast.success('Transfer completed successfully!')
    // Reset form
    setAmount('')
    setToAddress('')
    setToStellarAddress('')
    setMemo(null)
  }

  const handlePaymentBounced = () => {
    toast.error('Payment failed and was refunded.')
  }

  const intentConfig = getIntentConfig()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Intent Pay Bridge
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gasless, commission-free USDC transfers powered by Intent Pay
          </p>
        </CardHeader>
        <CardContent>
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">No Gas Fees</div>
                <div className="text-xs text-muted-foreground">Zero gas costs</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">No Commission</div>
                <div className="text-xs text-muted-foreground">Zero fees</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">Fast Transfer</div>
                <div className="text-xs text-muted-foreground">Under 5 minutes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form - Always Show */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your cross-chain USDC transfer. Connect your wallet when ready to proceed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source (Payin) */}
          <div className="space-y-3">
            <Label>From Chain</Label>
            <ChainSelect
              value={fromChainId}
              onValueChange={(chainId) => chainId && setFromChainId(chainId)}
              placeholder="Select source chain"
            />
            {evmConnected ? (
              <div className="text-sm text-green-600">
                ✓ EVM Connected: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                You can connect an EVM or Stellar wallet when you proceed
              </div>
            )}
            {stellarConnected && (
              <div className="text-sm text-green-600">
                ✓ Stellar Connected: {stellarAddress?.slice(0, 8)}...{stellarAddress?.slice(-8)}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {amount && parseFloat(amount) > 0 && parseFloat(amount) < MIN_USDC_AMOUNT && (
              <div className="text-xs text-red-600">
                Minimum order size is $0.10
              </div>
            )}
          </div>

          <Separator />

          {/* Destination (Payout) */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>To Chain</Label>
              <ChainSelect
                value={toChainId}
                onValueChange={(chainId) => chainId && setToChainId(chainId)}
                placeholder="Select destination chain"
                excludeChainId={fromChainId}
              />
            </div>

            {!isDestStellar && (
              <AddressInput
                value={toAddress}
                onChange={setToAddress}
                label="Destination Address"
                placeholder="0x..."
              />
            )}

            {isDestStellar && (
              <>
                <StellarAddressInput
                  value={toStellarAddress}
                  onChange={setToStellarAddress}
                  label="Destination Stellar Address"
                  required
                />
                <StellarMemoInput
                  destinationAddress={toStellarAddress}
                  memo={memo}
                  onMemoChange={setMemo}
                />
              </>
            )}
          </div>

          <Separator />

          {/* Intent Pay Button */}
          <div className="space-y-4">
            {intentConfig && isFormValid() ? (
              !isDestStellar ? (
                <RozoPayButton
                  appId={intentConfig.appId}
                  toChain={intentConfig.toChain!}
                  toToken={intentConfig.toToken!}
                  toAddress={intentConfig.toAddress as `0x${string}`}
                  toUnits={intentConfig.toUnits}
                  onPaymentStarted={handlePaymentStarted}
                  onPaymentCompleted={handlePaymentCompleted}
                  onPaymentBounced={handlePaymentBounced}
                />
              ) : (
                <RozoPayButton
                  appId={intentConfig.appId}
                  toChain={intentConfig.toChain!}
                  toToken={intentConfig.toToken!}
                  toAddress={ZERO_ADDRESS}
                  toStellarAddress={intentConfig.toStellarAddress}
                  toUnits={intentConfig.toUnits}
                  {...(intentConfig.memo ? { memo: intentConfig.memo } : {})}
                  onPaymentStarted={handlePaymentStarted}
                  onPaymentCompleted={handlePaymentCompleted}
                  onPaymentBounced={handlePaymentBounced}
                />
              )
            ) : (
              <div className="space-y-3">
                <Button disabled className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {!amount ? 'Enter Amount' :
                   (Number.isFinite(parseFloat(amount)) && parseFloat(amount) > 0 && parseFloat(amount) < MIN_USDC_AMOUNT)
                     ? 'Minimum $0.10'
                     : (!isFormValid() ? 'Complete Form' : 'Transfer USDC')}
                </Button>
                
                {/* Show wallet connection if not connected */}
                {!evmConnected && !stellarConnected && (
                  <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg">
                    <div className="mb-3">
                      <div className="text-sm font-medium">Connect Your Wallet</div>
                      <div className="text-xs text-muted-foreground">
                        Connect EVM or Stellar wallet to start gasless transfers
                      </div>
                    </div>
                    <UnifiedWalletConnect />
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-center text-muted-foreground">
              ✨ Powered by Intent Pay - No gas fees, no commission, instant settlement
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
