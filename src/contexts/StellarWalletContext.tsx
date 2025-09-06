'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
  ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit'
import { toast } from 'sonner'

interface StellarWalletContextType {
  stellarAddress: string
  stellarConnected: boolean
  stellarConnecting: boolean
  connectStellarWallet: () => Promise<void>
  disconnectStellarWallet: () => void
  stellarKit: StellarWalletsKit | null
}

const StellarWalletContext = createContext<StellarWalletContextType | undefined>(undefined)

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [stellarAddress, setStellarAddress] = useState('')
  const [stellarConnected, setStellarConnected] = useState(false)
  const [stellarConnecting, setStellarConnecting] = useState(false)
  const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null)

  useEffect(() => {
    // Initialize Stellar Wallets Kit
    const kit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    })
    setStellarKit(kit)
  }, [])

  const connectStellarWallet = async () => {
    if (!stellarKit) {
      toast.error('Stellar Wallets Kit not initialized')
      return
    }

    setStellarConnecting(true)
    try {
      // Show wallet selection modal
      await stellarKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          stellarKit.setWallet(option.id)
          try {
            const publicKey = await stellarKit.getAddress()
            console.log('Stellar publicKey response:', publicKey, typeof publicKey)
            // Handle both string and object response formats
            const address = typeof publicKey === 'string' ? publicKey : (publicKey as { address?: string }).address
            console.log('Extracted address:', address)
            setStellarAddress(address || '')
            setStellarConnected(true)
            toast.success(`Connected to ${option.name}`)
          } catch (error) {
            console.error('Error getting public key:', error)
            toast.error('Failed to get Stellar address')
          }
        },
      })
    } catch (error) {
      console.error('Error connecting to Stellar wallet:', error)
      toast.error('Failed to connect to Stellar wallet')
    } finally {
      setStellarConnecting(false)
    }
  }

  const disconnectStellarWallet = () => {
    setStellarAddress('')
    setStellarConnected(false)
    toast.info('Disconnected from Stellar wallet')
  }

  return (
    <StellarWalletContext.Provider
      value={{
        stellarAddress,
        stellarConnected,
        stellarConnecting,
        connectStellarWallet,
        disconnectStellarWallet,
        stellarKit,
      }}
    >
      {children}
    </StellarWalletContext.Provider>
  )
}

export function useStellarWallet() {
  const context = useContext(StellarWalletContext)
  if (context === undefined) {
    throw new Error('useStellarWallet must be used within a StellarWalletProvider')
  }
  return context
}