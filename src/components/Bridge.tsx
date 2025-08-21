'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { Settings, ArrowUpDown, Loader2 } from 'lucide-react'
import { ChainSelect } from './ChainSelect'
import { AmountInput } from './AmountInput'
import { AddressInput } from './AddressInput'
import { QuoteCard } from './QuoteCard'
import { BridgeStepper } from './BridgeStepper'
import { ChainSwitchPrompt } from './WalletConnect'
import { UnifiedWalletConnect } from './UnifiedWalletConnect'
import { IntentPayBridge } from './IntentPayBridge'
import { useBridgeStore } from '@/store/bridge'
// import { intentPay } from '@/lib/intentPay' // Removed - using real Intent Pay SDK now
import { getChainById } from '@/lib/chains'
import { validateAddress, validateAmount, validateChainSelection } from '@/lib/validation'
import { trackQuoteSuccess, trackQuoteError, trackApproval, trackBridge, trackUIInteraction } from '@/lib/analytics'
import { getTokenLogoUrl } from '@/lib/crypto-logos'

import { toast } from 'sonner'

export function Bridge() {
  // Use the new Intent Pay Bridge component for gasless transfers
  return <IntentPayBridge />
}

export function BridgeOld() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isQuoting, setIsQuoting] = useState(false)
  const [needsChainSwitch, setNeedsChainSwitch] = useState(false)

  const {
    form,
    quote,
    status,
    showAdvanced,
    savedRecipients,
    isApproving,
    isBridging,
    updateForm,
    setQuote,
    setShowAdvanced,
    addSavedRecipient,
    removeSavedRecipient,
    resetQuote,
    resetTransaction,
  } = useBridgeStore()

  // Get USDC balance for the current chain
  const fromChain = getChainById(form.fromChainId || 0)
  const { data: balance } = useBalance({
    address,
    token: fromChain?.usdcAddress,
    query: {
      enabled: isConnected && !!fromChain,
    },
  })

  // Update from address when wallet connects
  useEffect(() => {
    if (address && address !== form.fromAddress) {
      updateForm({ fromAddress: address })
    }
  }, [address, form.fromAddress, updateForm])

  // Update from chain when wallet chain changes
  useEffect(() => {
    if (chainId && chainId !== form.fromChainId) {
      updateForm({ fromChainId: chainId })
      resetQuote()
    }
  }, [chainId, form.fromChainId, updateForm, resetQuote])

  const handleGetQuote = useCallback(async () => {
    if (!form.fromChainId || !form.toChainId || !form.fromAddress || !form.toAddress || !form.amount) {
      return
    }

    // Validate form
    const chainValidation = validateChainSelection(form.fromChainId, form.toChainId)
    if (!chainValidation.isValid) {
      toast.error(chainValidation.error)
      return
    }

    const addressValidation = validateAddress(form.toAddress)
    if (!addressValidation.isValid) {
      toast.error(addressValidation.error)
      return
    }

    const amountValidation = validateAmount(form.amount, balance?.formatted)
    if (!amountValidation.isValid) {
      toast.error(amountValidation.error)
      return
    }

    try {
      setIsQuoting(true)
      resetQuote()

      const quoteParams = {
        fromChainId: form.fromChainId,
        toChainId: form.toChainId,
        from: form.fromAddress,
        to: addressValidation.checksumAddress!,
        token: fromChain!.usdcAddress,
        amount: form.amount,
        slippage: form.slippage,
      }

      const newQuote = await intentPay.quoteBridge(quoteParams)
      setQuote(newQuote)

      trackQuoteSuccess(
        form.fromChainId,
        form.toChainId,
        form.amount,
        newQuote.route.name,
        newQuote.fees.bridgeFee
      )

      toast.success('Quote received!')
    } catch (error) {
      console.error('Failed to get quote:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get quote'
      
      trackQuoteError(
        form.fromChainId,
        form.toChainId,
        form.amount,
        errorMessage
      )

      toast.error(errorMessage)
    } finally {
      setIsQuoting(false)
    }
  }, [form, balance, fromChain, setQuote, resetQuote])

  // Auto-quote when form is complete
  useEffect(() => {
    const shouldQuote = 
      form.fromChainId &&
      form.toChainId &&
      form.fromAddress &&
      form.toAddress &&
      form.amount &&
      parseFloat(form.amount) > 0 &&
      !quote &&
      !isQuoting

    if (shouldQuote) {
      handleGetQuote()
    }
  }, [form, quote, isQuoting, handleGetQuote])

  const handleAcceptQuote = async () => {
    if (!quote || !isConnected) return

    // Check if we need to switch chains
    if (chainId !== form.fromChainId) {
      setNeedsChainSwitch(true)
      return
    }

    try {
      // Handle approval if needed
      if (quote.approvalRequired) {
        // TODO: Implement approval flow
        trackApproval('submitted')
        toast.info('Approval transaction submitted...')
        
        // Mock approval for now
        await new Promise(resolve => setTimeout(resolve, 2000))
        trackApproval('success')
        toast.success('Token approval confirmed!')
      }

      // Submit bridge transaction
      trackBridge('submitted', quote.id)
      toast.info('Bridge transaction submitted...')

      const result = await intentPay.submitBridge()

      trackBridge('success', result.intentId, result.txHash)
      toast.success('Bridge transaction confirmed!')

      // Start status tracking
      startStatusTracking(result.intentId)

    } catch (error) {
      console.error('Failed to execute bridge:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bridge transaction failed'
      
      trackBridge('fail', quote.id, undefined, errorMessage)
      toast.error(errorMessage)
    }
  }

  const startStatusTracking = async (intentId: string) => {
    // TODO: Implement status polling
    console.log('Starting status tracking for:', intentId)
  }

  const handleSwapChains = () => {
    const fromChainId = form.fromChainId
    const toChainId = form.toChainId
    
    updateForm({
      fromChainId: toChainId,
      toChainId: fromChainId,
    })
    
    resetQuote()
    trackUIInteraction('advanced_toggled')
  }



  const canGetQuote = 
    form.fromChainId &&
    form.toChainId &&
    form.fromAddress &&
    form.toAddress &&
    form.amount &&
    parseFloat(form.amount) > 0

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Wallet Connection */}
      {!isConnected && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">Connect Your Wallet</div>
              <div className="text-sm text-muted-foreground">
                Connect your EVM or Stellar wallet to start cross-chain transfers
              </div>
              <UnifiedWalletConnect />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chain Switch Prompt */}
      {needsChainSwitch && form.fromChainId && (
        <ChainSwitchPrompt
          requiredChainId={form.fromChainId}
          currentChainId={chainId}
          onSwitch={() => {
            // TODO: Implement chain switch
            setNeedsChainSwitch(false)
          }}
          onCancel={() => setNeedsChainSwitch(false)}
        />
      )}

      {/* Bridge Form */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Intent Pay Transfer</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdvanced(!showAdvanced)
                    trackUIInteraction('advanced_toggled')
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <UnifiedWalletConnect />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Cross-chain USDC transfers powered by @rozoai/intent-pay v0.0.18-beta.9
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payin Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  💰 Payin
                </Label>
                {balance && (
                  <div className="text-sm text-muted-foreground">
                    Balance: {parseFloat(balance.formatted).toFixed(4)} USDC
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Chain</Label>
                  <ChainSelect
                    value={form.fromChainId}
                    onValueChange={(chainId) => {
                      updateForm({ fromChainId: chainId })
                      resetQuote()
                    }}
                    placeholder="Select payin chain"
                    excludeChainId={form.toChainId}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Asset</Label>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      $
                    </div>
                    <span className="font-medium">USDC</span>
                    <span className="text-sm text-muted-foreground ml-auto">Default</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Amount</Label>
                  <AmountInput
                    value={form.amount}
                    onChange={(amount) => {
                      updateForm({ amount })
                      resetQuote()
                    }}
                    balance={balance?.formatted}
                    isLoadingBalance={!balance && isConnected}
                    token={{
                      symbol: 'USDC',
                      decimals: 6,
                      logoUrl: getTokenLogoUrl('USDC'),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Arrow Separator */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1"></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapChains}
                  className="rounded-full w-10 h-10 p-0"
                  disabled={!form.fromChainId && !form.toChainId}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <div className="h-px bg-border flex-1"></div>
              </div>
            </div>

            {/* Payout Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-green-600 dark:text-green-400">
                💸 Payout
              </Label>
              
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Chain</Label>
                  <ChainSelect
                    value={form.toChainId}
                    onValueChange={(chainId) => {
                      updateForm({ toChainId: chainId })
                      resetQuote()
                    }}
                    placeholder="Select payout chain"
                    excludeChainId={form.fromChainId}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Asset</Label>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      $
                    </div>
                    <span className="font-medium">USDC</span>
                    <span className="text-sm text-muted-foreground ml-auto">Default</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">To Address</Label>
                  <AddressInput
                    value={form.toAddress}
                    onChange={(toAddress) => {
                      updateForm({ toAddress })
                      resetQuote()
                    }}
                    savedRecipients={savedRecipients}
                    onSaveRecipient={addSavedRecipient}
                    onRemoveRecipient={removeSavedRecipient}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Advanced</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Slippage</Label>
                      <div className="flex gap-2 mt-1">
                        {[0.5, 1.0, 2.0].map((slippage) => (
                          <Button
                            key={slippage}
                            variant={form.slippage === slippage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateForm({ slippage })}
                            className="flex-1"
                          >
                            {slippage}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Get Intent Quote Button */}
            {!quote && (
              <Button
                onClick={handleGetQuote}
                disabled={!canGetQuote || isQuoting}
                className="w-full"
                size="lg"
              >
                {isQuoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isQuoting ? 'Getting Intent Quote...' : 'Get Intent Quote'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quote Card */}
      {quote && form.fromChainId && form.toChainId && (
        <QuoteCard
          quote={quote}
          fromChainId={form.fromChainId}
          toChainId={form.toChainId}
          amount={form.amount}
          onAccept={handleAcceptQuote}
          onReject={() => {
            resetQuote()
            toast.info('Quote cleared. Modify your parameters to get a new quote.')
          }}
          isAccepting={isApproving || isBridging}
        />
      )}

      {/* Bridge Status */}
      {status && (
        <BridgeStepper
          status={status}
          onRetry={() => {
            resetTransaction()
            handleAcceptQuote()
          }}
          onRefresh={() => {
            if (status.intentId) {
              startStatusTracking(status.intentId)
            }
          }}
        />
      )}
    </div>
  )
}
