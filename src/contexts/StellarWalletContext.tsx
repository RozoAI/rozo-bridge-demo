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

const STORAGE_KEY = 'stellar_wallet_connection'

interface StoredWalletData {
  address: string
  walletId: string
  walletName: string
  timestamp: number
}

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [stellarAddress, setStellarAddress] = useState('')
  const [stellarConnected, setStellarConnected] = useState(false)
  const [stellarConnecting, setStellarConnecting] = useState(false)
  const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load stored wallet data from localStorage
  const loadStoredWallet = (): StoredWalletData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const data = JSON.parse(stored) as StoredWalletData
      
      // Check if data is not too old (24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (Date.now() - data.timestamp > MAX_AGE) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error loading stored wallet:', error)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  // Save wallet data to localStorage
  const saveWalletData = (address: string, walletId: string, walletName: string) => {
    try {
      const data: StoredWalletData = {
        address,
        walletId,
        walletName,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving wallet data:', error)
    }
  }

  // Clear stored wallet data
  const clearStoredWallet = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing stored wallet:', error)
    }
  }

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
    setIsInitialized(true)
  }, [])

  // Auto-reconnect on initialization
  useEffect(() => {
    if (!isInitialized || !stellarKit) return
    
    const autoReconnect = async () => {
      const storedData = loadStoredWallet()
      if (!storedData) return
      
      try {
        // Set the previously used wallet
        stellarKit.setWallet(storedData.walletId)
        
        // Small delay for wallet to initialize
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Try to reconnect
        const publicKey = await stellarKit.getAddress()
        const address = typeof publicKey === 'string' ? publicKey : (publicKey as { address?: string }).address
        
        if (address && address === storedData.address) {
          setStellarAddress(address)
          setStellarConnected(true)
          console.log('Auto-reconnected to', storedData.walletName)
        } else {
          // Address mismatch or connection failed, clear stored data
          clearStoredWallet()
        }
      } catch (error) {
        console.log('Auto-reconnect failed:', error)
        // Clear stored data if auto-reconnect fails
        clearStoredWallet()
      }
    }
    
    autoReconnect()
  }, [isInitialized, stellarKit])

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
            // Save wallet data for auto-reconnect
            saveWalletData(address, option.id, option.name)
            toast.success(`Connected to ${option.name}`)
          } catch (error: unknown) {
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
              const errorMessage = error instanceof Error ? error.message : String(error)
              if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
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
    clearStoredWallet() // Clear stored wallet data on disconnect
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