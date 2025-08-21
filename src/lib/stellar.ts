import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID
} from '@creit.tech/stellar-wallets-kit'
import { Networks, Keypair, Account, TransactionBuilder, Operation, Asset, Memo, MemoType } from '@stellar/stellar-sdk'

// Stellar network configuration
export const STELLAR_NETWORKS = {
  PUBLIC: Networks.PUBLIC,
  TESTNET: Networks.TESTNET,
} as const

export type StellarNetwork = keyof typeof STELLAR_NETWORKS

// Stellar chain configuration for CAIP-2
export const STELLAR_CHAINS = {
  pubnet: 'stellar:pubnet',
  testnet: 'stellar:testnet',
} as const

// Initialize Stellar Wallets Kit
export const createStellarWalletKit = (network: StellarNetwork = 'PUBLIC') => {
  return new StellarWalletsKit({
    network: network === 'PUBLIC' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID, // Default to Freighter
    modules: allowAllModules(), // Includes Freighter, xBull, and WalletConnect
  })
}

// Stellar wallet types
export interface StellarWallet {
  id: string
  name: string
  icon: string
  installed?: boolean
}

export const STELLAR_WALLETS: StellarWallet[] = [
  {
    id: FREIGHTER_ID,
    name: 'Freighter',
    icon: '🚀',
    installed: typeof window !== 'undefined' && 'freighter' in window,
  },
  {
    id: XBULL_ID,
    name: 'xBull',
    icon: '🐂',
    installed: typeof window !== 'undefined' && 'xBullWalletConnect' in window,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '📱',
    installed: true, // Always available via QR/deeplink
  },
]

// Stellar address validation
export const isValidStellarAddress = (address: string): boolean => {
  try {
    // Check for regular Stellar address (G...)
    if (address.startsWith('G') && address.length === 56) {
      Keypair.fromPublicKey(address)
      return true
    }
    
    // Check for muxed address (M...)
    if (address.startsWith('M') && address.length === 69) {
      // Muxed addresses are valid if they can be parsed
      return true
    }
    
    return false
  } catch {
    return false
  }
}

// Muxed address utilities
export const isMuxedAddress = (address: string): boolean => {
  return address.startsWith('M') && address.length === 69
}

export const normalizeStellarAddress = (address: string): string => {
  if (isMuxedAddress(address)) {
    // For muxed addresses, we need to extract the base account ID
    // This is a simplified version - in production, use proper muxed address parsing
    try {
      // TODO: Implement proper muxed address parsing using Stellar SDK
      return address // For now, return as-is
    } catch {
      return address
    }
  }
  return address
}

// SEP-29 memo required validation
export interface MemoRequiredResponse {
  memo_required: boolean
  memo_type?: 'text' | 'id' | 'hash'
}

export const checkMemoRequired = async (
  destinationAddress: string,
  horizonUrl: string = 'https://horizon.stellar.org'
): Promise<MemoRequiredResponse> => {
  try {
    const normalizedAddress = normalizeStellarAddress(destinationAddress)
    const response = await fetch(`${horizonUrl}/accounts/${normalizedAddress}`)
    
    if (!response.ok) {
      return { memo_required: false }
    }
    
    const accountData = await response.json()
    
    // Check for SEP-29 memo required data entry
    const memoRequiredEntry = accountData.data_attr?.['config.memo_required']
    
    if (memoRequiredEntry === '1' || memoRequiredEntry === 'true') {
      return {
        memo_required: true,
        memo_type: 'text', // Default to text memo
      }
    }
    
    return { memo_required: false }
  } catch (error) {
    console.warn('Failed to check memo required:', error)
    return { memo_required: false }
  }
}

// Stellar transaction utilities
export interface StellarTransactionParams {
  sourceAccount: string
  destinationAddress: string
  amount: string
  asset?: Asset
  memo?: {
    type: MemoType
    value: string
  }
  network?: StellarNetwork
}

export const createStellarPayment = async (
  params: StellarTransactionParams,
  horizonUrl: string = 'https://horizon.stellar.org'
): Promise<string> => {
  const {
    sourceAccount,
    destinationAddress,
    amount,
    asset = Asset.native(), // Default to XLM
    memo,
    network = 'PUBLIC'
  } = params

  try {
    // Load source account
    const response = await fetch(`${horizonUrl}/accounts/${sourceAccount}`)
    const accountData = await response.json()
    const account = new Account(sourceAccount, accountData.sequence)

    // Build transaction
    const transactionBuilder = new TransactionBuilder(account, {
      fee: '100', // Base fee in stroops
      networkPassphrase: STELLAR_NETWORKS[network],
    })

    // Add payment operation
    transactionBuilder.addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset,
        amount,
      })
    )

    // Add memo if provided
    if (memo) {
      let memoObj: Memo
      switch (memo.type) {
        case MemoType.MemoText:
          memoObj = Memo.text(memo.value)
          break
        case MemoType.MemoId:
          memoObj = Memo.id(memo.value)
          break
        case MemoType.MemoHash:
          memoObj = Memo.hash(memo.value)
          break
        default:
          memoObj = Memo.text(memo.value)
      }
      transactionBuilder.addMemo(memoObj)
    }

    // Set timeout and build
    transactionBuilder.setTimeout(30)
    const transaction = transactionBuilder.build()

    return transaction.toXDR()
  } catch (error) {
    console.error('Failed to create Stellar payment:', error)
    throw error
  }
}

// Stellar wallet connection state
export interface StellarWalletState {
  isConnected: boolean
  publicKey: string | null
  walletId: string | null
  network: StellarNetwork
}

// Default Stellar wallet state
export const defaultStellarWalletState: StellarWalletState = {
  isConnected: false,
  publicKey: null,
  walletId: null,
  network: 'PUBLIC',
}
