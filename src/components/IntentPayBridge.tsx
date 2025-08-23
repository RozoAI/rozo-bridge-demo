'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Zap, DollarSign, Clock, CheckCircle, Settings, RefreshCw, Loader2 } from 'lucide-react'
import { ChainSelect } from './ChainSelect'
import { AddressInput } from './AddressInput'
import { StellarAddressInput } from './StellarAddressInput'

import { RozoWalletSelector } from './RozoWalletSelector' // Updated import
import { RozoPayButton } from '@rozoai/intent-pay'
import { getAddress } from 'viem'
import { 
  createIntentConfig, 
  DEFAULT_INTENT_PAY_CONFIG,
  BASE_USDC
} from '@/lib/intentPay'
import { isValidStellarAddress } from '@/lib/stellar'
import { toast } from 'sonner'



export function IntentPayBridge() {
  const MIN_USDC_AMOUNT = 0.10
  const [toChainId, setToChainId] = useState<number>(8453) // Base
  const [amount, setAmount] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [toStellarAddress, setToStellarAddress] = useState('')
  const [showPayButton, setShowPayButton] = useState(false)
  const [configuredAmount, setConfiguredAmount] = useState('')
  const [configuredChainId, setConfiguredChainId] = useState<number>(0)
  const [configuredAddress, setConfiguredAddress] = useState('')
  const [configuredStellarAddress, setConfiguredStellarAddress] = useState('')
  const [paymentKey, setPaymentKey] = useState(0) // Add a key to force remount
  const [isGenerating, setIsGenerating] = useState(false) // Add loading state
  const [shouldRenderButton, setShouldRenderButton] = useState(true) // Control button rendering
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  
  // Wallet connection is handled by Intent Pay SDK

  // Unified selection flags
  const isDestStellar = toChainId === 1500 || toChainId === 1501

  // Validate form
  const isFormValid = () => {
    if (!amount || parseFloat(amount) <= 0) return false
    if (!Number.isFinite(parseFloat(amount))) return false
    if (parseFloat(amount) < MIN_USDC_AMOUNT) return false
    if (isDestStellar) {
      return !!toStellarAddress && isValidStellarAddress(toStellarAddress)
    }
    return !!toAddress
  }

  // Create stable external ID based on payment parameters
  const externalId = useMemo(() => {
    if (isDestStellar) {
      return `stellar-${toStellarAddress}-${amount}`
    }
    return `bridge-${toChainId}-${toAddress}-${amount}`
  }, [toChainId, toAddress, toStellarAddress, amount, isDestStellar])

  // Handle Generate Payment Button
  const handleGeneratePayment = async () => {
    if (!isFormValid()) {
      toast.error('Please complete all required fields')
      return
    }
    
    // Clear any existing timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current)
    }
    
    // Show loading state and completely unmount payment button
    setIsGenerating(true)
    setShowPayButton(false)
    setShouldRenderButton(false) // Completely remove from DOM
    
    // Force cleanup of any existing connections
    if (typeof window !== 'undefined' && (window as any).rozoPayConnection) {
      try {
        (window as any).rozoPayConnection.disconnect?.();
        delete (window as any).rozoPayConnection;
      } catch (e) {
        console.log('Error cleaning up connection:', e)
      }
    }
    
    // Wait longer to ensure complete cleanup
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Save current configuration - only save the relevant address
    setConfiguredAmount(amount)
    setConfiguredChainId(toChainId)
    if (isDestStellar) {
      setConfiguredAddress('') // Clear EVM address
      setConfiguredStellarAddress(toStellarAddress)
    } else {
      setConfiguredAddress(toAddress)
      setConfiguredStellarAddress('') // Clear Stellar address
    }
    setPaymentKey(Date.now()) // Use timestamp as unique key
    
    // Re-enable button rendering
    setShouldRenderButton(true)
    
    // Wait another moment before showing the button
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setShowPayButton(true)
    setIsGenerating(false)
    
    toast.success('Payment button generated! Click "Pay" to proceed.')
  }

  // Handle configuration changes
  const handleConfigChange = () => {
    setShowPayButton(false)
  }

  // Check if configuration has changed
  const hasConfigChanged = () => {
    if (!showPayButton) return false
    return (
      amount !== configuredAmount ||
      toChainId !== configuredChainId ||
      toAddress !== configuredAddress ||
      toStellarAddress !== configuredStellarAddress
    )
  }

  // Create Intent Pay configuration for configured values
  const getIntentConfig = () => {
    const isConfiguredStellar = configuredChainId === 1500 || configuredChainId === 1501
    const configExternalId = isConfiguredStellar 
      ? `stellar-${configuredStellarAddress}-${configuredAmount}`
      : `bridge-${configuredChainId}-${configuredAddress}-${configuredAmount}`
    
    if (isConfiguredStellar) {
      return createIntentConfig({
        appId: DEFAULT_INTENT_PAY_CONFIG.appId,
        toStellarAddress: configuredStellarAddress,
        amount: configuredAmount,
        externalId: configExternalId,
      })
    }

    return createIntentConfig({
      appId: DEFAULT_INTENT_PAY_CONFIG.appId,
      toChainId: configuredChainId,
      toAddress: configuredAddress as `0x${string}`,
      amount: configuredAmount,
      externalId: configExternalId,
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
    setShowPayButton(false)
    setConfiguredAmount('')
    setConfiguredAddress('')
    setConfiguredStellarAddress('')
  }

  const handlePaymentBounced = () => {
    toast.error('Payment failed and was refunded.')
  }

  // Remove memoization to ensure fresh config on every render
  const intentConfig = showPayButton ? getIntentConfig() : null
  
  // Debug logging
  if (intentConfig) {
    console.log('IntentConfig:', {
      toUnits: intentConfig.toUnits,
      configuredAmount,
      paymentKey,
      timestamp: new Date().toISOString()
    })
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
      }
      // Clean up any connections on unmount
      if (typeof window !== 'undefined' && (window as any).rozoPayConnection) {
        try {
          (window as any).rozoPayConnection.disconnect?.();
          delete (window as any).rozoPayConnection;
        } catch (e) {
          console.log('Error cleaning up connection on unmount:', e)
        }
      }
    }
  }, [])

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
          <div>
            <CardTitle>Transfer Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure your cross-chain USDC transfer. Source chain will be selected when you pay.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                handleConfigChange()
              }}
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
                onValueChange={(chainId) => {
                  if (chainId) {
                    setToChainId(chainId)
                    // Clear addresses when switching between EVM and Stellar
                    const newIsDestStellar = chainId === 1500 || chainId === 1501
                    if (newIsDestStellar !== isDestStellar) {
                      setToAddress('')
                      setToStellarAddress('')
                    }
                    handleConfigChange()
                  }
                }}
                placeholder="Select destination chain"
              />
            </div>

            {!isDestStellar && (
              <AddressInput
                value={toAddress}
                onChange={(value) => {
                  setToAddress(value)
                  handleConfigChange()
                }}
                label="Destination Address"
                placeholder="0x..."
              />
            )}

            {isDestStellar && (
              <StellarAddressInput
                value={toStellarAddress}
                onChange={(value) => {
                  setToStellarAddress(value)
                  handleConfigChange()
                }}
                label="Destination Stellar Address"
                required
              />
            )}
          </div>

          <Separator />

          {/* Payment Actions */}
          <div className="space-y-4">
            {/* Configuration Status */}
            {hasConfigChanged() && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  <div className="text-sm">
                    <div className="font-medium text-amber-900 dark:text-amber-100">Configuration Changed</div>
                    <div className="text-amber-700 dark:text-amber-300">Click "Generate Payment" to update the payment button</div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Payment Button */}
            {(!showPayButton || hasConfigChanged()) && !isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleGeneratePayment}
                  disabled={!isFormValid()}
                  className="w-64" 
                  size="lg"
                  variant={hasConfigChanged() ? "default" : "default"}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {hasConfigChanged() ? 'Update Payment' : 'Generate Payment'}
                </Button>
                {!isFormValid() && (
                  <div className="text-xs text-center text-muted-foreground">
                    {!amount ? 'Enter amount to continue' :
                     (Number.isFinite(parseFloat(amount)) && parseFloat(amount) > 0 && parseFloat(amount) < MIN_USDC_AMOUNT)
                       ? 'Minimum amount is $0.10'
                       : 'Complete all required fields'}
                  </div>
                )}
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <Button disabled className="w-64" size="lg">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Payment...
                </Button>
              </div>
            ) : showPayButton && !hasConfigChanged() ? (
              <div className="space-y-4">
                {/* Payment Summary */}
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Payment Ready</div>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <div>Amount: {configuredAmount} USDC</div>
                      <div>Destination: {configuredChainId === 1500 || configuredChainId === 1501 ? 'Stellar' : 'Chain ID ' + configuredChainId}</div>
                      <div className="truncate">To: {configuredChainId === 1500 || configuredChainId === 1501 ? configuredStellarAddress : configuredAddress}</div>
                    </div>
                  </div>
                </div>

                {/* RozoPayButton */}
                {shouldRenderButton && (
                  <div className="flex justify-center" key={`payment-button-wrapper-${paymentKey}`}>
                    {intentConfig && (
                      <>
                        {configuredChainId !== 1500 && configuredChainId !== 1501 ? (
                          <RozoPayButton
                            key={`rozo-pay-button-${paymentKey}-${configuredAmount}-${configuredChainId}-${configuredAddress}`}
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
                            key={`rozo-pay-button-stellar-${paymentKey}-${configuredAmount}-${configuredStellarAddress}`}
                            appId={intentConfig.appId}
                            toChain={BASE_USDC.chainId}
                            toAddress={getAddress("0x0000000000000000000000000000000000000000")}
                            toStellarAddress={intentConfig.toStellarAddress}
                            toUnits={intentConfig.toUnits}
                            toToken={getAddress(BASE_USDC.token)}
                            onPaymentStarted={handlePaymentStarted}
                            onPaymentCompleted={handlePaymentCompleted}
                            onPaymentBounced={handlePaymentBounced}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null}
            
            <div className="text-xs text-center text-muted-foreground">
              ✨ Powered by Intent Pay - No gas fees, no commission, instant settlement
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
