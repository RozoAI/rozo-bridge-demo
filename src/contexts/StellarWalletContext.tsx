'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
  LOBSTR_ID,
  ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit'
import {
  WalletConnectModule,
  WalletConnectAllowedMethods,
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module'
import { toast } from 'sonner'
import { setupCryptoPolyfill } from '@/utils/polyfills'

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
    // Setup crypto polyfill for mobile browsers
    setupCryptoPolyfill()
    
    // Detect if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    // Create modules array - include WalletConnect for mobile
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7440dd8acf85933ffcc775ec6675d4a9'
    
    const modules = [
      ...allowAllModules(),
      new WalletConnectModule({
        url: typeof window !== 'undefined' ? window.location.origin : 'https://rozo-bridge-demo.vercel.app',
        projectId: walletConnectProjectId,
        method: WalletConnectAllowedMethods.SIGN,
        description: 'Rozo Bridge - Transfer USDC across chains',
        name: 'Rozo Bridge',
        icons: ['/logos/USDC.png'],
        network: WalletNetwork.PUBLIC,
      }),
    ]
    
    // Initialize Stellar Wallets Kit with appropriate default wallet
    // On mobile, we don't set a default to allow all wallets to show
    const kit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: isMobile ? undefined : XBULL_ID,
      modules,
    })
    setStellarKit(kit)
  }, [])

  const connectStellarWallet = async () => {
    if (!stellarKit) {
      toast.error('Stellar Wallets Kit not initialized')
      return
    }

    setStellarConnecting(true)
    
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    try {
      // Show wallet selection modal
      await stellarKit.openModal({
        modalTitle: 'Select Stellar Wallet',
        onWalletSelected: async (option: ISupportedWallet) => {
          console.log('Selected wallet:', option.name, option.id)
          stellarKit.setWallet(option.id)
          
          // Add a small delay for mobile wallets to initialize
          if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          
          try {
            const publicKey = await stellarKit.getAddress()
            console.log('Stellar publicKey response:', publicKey)
            
            // Handle both string and object response formats
            const address = typeof publicKey === 'string' ? publicKey : (publicKey as { address?: string }).address
            
            if (!address) {
              throw new Error('No address received from wallet')
            }
            
            setStellarAddress(address)
            setStellarConnected(true)
            toast.success(`Connected to ${option.name}`)
          } catch (error: any) {
            console.error('Error connecting to wallet:', error)
            
            // Provide more helpful error messages
            if (isMobile) {
              if (option.id === LOBSTR_ID) {
                toast.error('Could not connect to LOBSTR. Please ensure the app is installed and you have enabled wallet connections in the app settings.')
              } else {
                toast.error(`Could not connect to ${option.name}. Please ensure the app is installed and running.`)
              }
            } else {
              // Check for specific error types
              if (error?.message?.includes('not found') || error?.message?.includes('not installed')) {
                toast.error(`${option.name} wallet extension not found. Please install it first.`)
              } else {
                toast.error('Failed to connect. Please try again.')
              }
            }
          }
        },
      })
    } catch (error) {
      console.error('Error connecting to Stellar wallet:', error)
      
      if (isMobile) {
        toast.error('Failed to connect. Please ensure your wallet app is installed and configured.')
      } else {
        toast.error('Failed to connect to Stellar wallet')
      }
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