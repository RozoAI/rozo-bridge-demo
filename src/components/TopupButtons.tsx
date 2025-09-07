'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Loader2, Wallet, CheckCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useStellarWallet } from '@/contexts/StellarWalletContext'
import { formatStellarAddress } from '@/utils/address'

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
  const [manualStellarAddress, setManualStellarAddress] = useState('')
  const [useManualEntry, setUseManualEntry] = useState(false)

  const handleProceedWithTopup = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount')
      return
    }
    
    const addressToUse = useManualEntry ? manualStellarAddress : stellarAddress
    
    if (!addressToUse) {
      toast.error('Please connect your Stellar wallet or enter an address')
      return
    }
    
    // Validate manual Stellar address format (starts with G and is 56 characters)
    if (useManualEntry && (!manualStellarAddress.startsWith('G') || manualStellarAddress.length !== 56)) {
      toast.error('Invalid Stellar address format')
      return
    }
    
    // Emit selection for Stellar (chainId 1500 for Stellar testnet or 1501 for mainnet) with amount
    onAddressSelected(1500, '', addressToUse, amount)
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
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stellar Wallet Connection */}
          <div className="space-y-4">
            {!stellarConnected && !useManualEntry ? (
                <div className="space-y-4">
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
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setUseManualEntry(true)}
                    className="w-full"
                  >
                    Enter Stellar Address
                  </Button>
                </div>
            ) : useManualEntry && !stellarConnected ? (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter Stellar address (e.g., G...)"
                  value={manualStellarAddress}
                  onChange={(e) => setManualStellarAddress(e.target.value)}
                  className="w-full font-mono text-sm"
                />
                {manualStellarAddress && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Address entered: {formatStellarAddress(manualStellarAddress)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(manualStellarAddress)
                            toast.success('Address copied!')
                          } catch {
                            toast.error('Failed to copy address')
                          }
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUseManualEntry(false)
                    setManualStellarAddress('')
                  }}
                  className="w-full"
                >
                  Back to wallet connection
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="text-sm min-w-0 flex-1">
                      <div className="font-medium text-green-900 dark:text-green-100">Wallet Connected</div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-700 dark:text-green-300 font-mono text-xs">
                          {formatStellarAddress(stellarAddress)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(stellarAddress)
                              toast.success('Address copied!')
                            } catch {
                              toast.error('Failed to copy address')
                            }
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
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
                      setUseManualEntry(false)
                      setManualStellarAddress('')
                    }}
                    className="flex-shrink-0"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Amount Selection - Show after wallet is connected or address is entered */}
          {(stellarConnected || (useManualEntry && manualStellarAddress)) && (
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
                    min="0.1"
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