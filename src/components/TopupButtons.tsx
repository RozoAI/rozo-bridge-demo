'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Loader2, Wallet, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useStellarWallet } from '@/contexts/StellarWalletContext'

interface TopupButtonsProps {
  onAddressSelected: (chainId: number, address: string, stellarAddress?: string, amount?: number) => void
}

const PRESET_AMOUNTS = [1, 100, 1000]

export function TopupButtons({ onAddressSelected }: TopupButtonsProps) {
  const { 
    stellarAddress, 
    stellarConnected, 
    stellarConnecting, 
    connectStellarWallet,
    disconnectStellarWallet 
  } = useStellarWallet()
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')

  const handleProceedWithTopup = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount')
      return
    }
    
    if (!stellarConnected || !stellarAddress) {
      toast.error('Please connect your Stellar wallet first')
      return
    }
    
    // Emit selection for Stellar (chainId 1500 for Stellar testnet or 1501 for mainnet) with amount
    onAddressSelected(1500, '', stellarAddress, amount)
    toast.success(`Stellar address configured! Proceeding with ${amount} USDC payment...`)
  }

  const handleAmountSelection = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('') // Clear custom amount when selecting a preset
  }
  
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null) // Clear preset selection when typing custom amount
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="/logos/stellar.svg" alt="Stellar" className="h-6 w-6" />
            Top up your Stellar Wallet
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top up USDC on your Stellar wallet with Base USDC
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stellar Wallet Connection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Step 1: Connect Your Stellar Wallet</h3>
            </div>

            {!stellarConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p>Connect your Stellar wallet to continue</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={connectStellarWallet}
                    disabled={stellarConnecting}
                    className="w-full"
                  >
                    {stellarConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Stellar Wallet
                      </>
                    )}
                  </Button>
                </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <div className="font-medium text-green-900 dark:text-green-100">Wallet Connected</div>
                      <div className="text-green-700 dark:text-green-300 truncate max-w-xs">
                        {stellarAddress}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      disconnectStellarWallet()
                      setSelectedAmount(null)
                      setCustomAmount('')
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Amount Selection - Only show after wallet is connected */}
          {stellarConnected && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Step 2: Select Amount (USDC)</h3>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelection(amount)}
                      className="h-12"
                    >
                      {amount} USDC
                    </Button>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Other amount:</span>
                  <Input
                    type="number"
                    placeholder="Enter amount in USDC"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleProceedWithTopup}
                className="w-full" 
                size="lg"
                disabled={!selectedAmount && !customAmount}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Proceed with {customAmount || selectedAmount} USDC Top Up
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-center text-muted-foreground">
              ✨ Powered by Rozo - Visa for stablecoins
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}