'use client'

import { useState } from 'react'
import { TopupButtons } from './TopupButtons'
import { IntentPayBridge } from './IntentPayBridge'

export function TopupFlow() {
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedStellarAddress, setSelectedStellarAddress] = useState<string>('')
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const handleAddressSelected = (chainId: number, address: string, stellarAddress?: string, amount?: number) => {
    setSelectedChainId(chainId)
    
    // Determine if this is Stellar
    const isStellar = chainId === 1500 || chainId === 1501
    
    if (isStellar && stellarAddress) {
      setSelectedStellarAddress(stellarAddress)
      setSelectedAddress('')
    } else {
      setSelectedAddress(address)
      setSelectedStellarAddress('')
    }
    
    // Set the amount if provided
    if (amount) {
      setSelectedAmount(amount)
    }
    
    // Show the payment component
    setShowPayment(true)
  }

  const handleTopupComplete = () => {
    // Reset to initial state after successful payment
    setSelectedAddress('')
    setSelectedStellarAddress('')
    setSelectedChainId(null)
    setShowPayment(false)
  }

  const handleGoBack = () => {
    // Go back to the address selection screen
    setShowPayment(false)
    // Keep the selected values so user can modify them if needed
  }

  return (
    <div className="space-y-6">
      {!showPayment ? (
        <TopupButtons onAddressSelected={handleAddressSelected} />
      ) : (
        <IntentPayBridge
          preConfiguredChainId={selectedChainId!}
          preConfiguredAddress={selectedAddress}
          preConfiguredStellarAddress={selectedStellarAddress}
          preConfiguredAmount={selectedAmount || undefined}
          isTopupFlow={true}
          onTopupComplete={handleTopupComplete}
          onGoBack={handleGoBack}
        />
      )}
    </div>
  )
}