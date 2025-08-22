import { Chain } from 'viem'
import { mainnet, polygon, arbitrum, optimism, base, bsc, sepolia, polygonMumbai } from 'viem/chains'

// Extended interface for all supported chains (EVM and non-EVM)
export interface SupportedChain extends Chain {
  logo: string
  usdcAddress?: `0x${string}` // Optional for non-EVM chains
  explorerUrl: string
  ecosystem: 'EVM' | 'Solana' | 'Stellar'
}

// Non-EVM chain definitions
const solanaMainnet = {
  id: 900,
  name: 'Solana Mainnet',
  nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.mainnet-beta.solana.com'] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
  },
} as const

const solanaDevnet = {
  id: 901,
  name: 'Solana Devnet',
  nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.devnet.solana.com'] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
  },
} as const

const stellarMainnet = {
  id: 1500,
  name: 'Stellar Mainnet',
  nativeCurrency: { name: 'XLM', symbol: 'XLM', decimals: 7 },
  rpcUrls: {
    default: { http: ['https://horizon.stellar.org'] },
  },
  blockExplorers: {
    default: { name: 'Stellar Explorer', url: 'https://stellar.expert' },
  },
} as const

const stellarTestnet = {
  id: 1501,
  name: 'Stellar Testnet',
  nativeCurrency: { name: 'XLM', symbol: 'XLM', decimals: 7 },
  rpcUrls: {
    default: { http: ['https://horizon-testnet.stellar.org'] },
  },
  blockExplorers: {
    default: { name: 'Stellar Explorer', url: 'https://stellar.expert' },
  },
} as const

// USDC contract addresses on EVM chains only (payin supported chains)
const USDC_ADDRESSES = {
  [mainnet.id]: '0xA0b86a33E6441b8C4e6b2b0f6a2b1b8C4e6b2b0f' as const, // Ethereum Mainnet - USDC
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const, // Sepolia Testnet - USDC
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const, // Base - USDC
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as const, // Arbitrum - USDC
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as const, // Optimism - USDC
  [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const, // Polygon - USDC
  [bsc.id]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as const, // BSC - USDC
  [polygonMumbai.id]: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23' as const, // Mumbai Testnet - USDC
} as const

// Helper function to get chain logo path
const getChainLogo = (chainId: number): string => {
  switch (chainId) {
    case mainnet.id: return '/logos/ethereum.png' // Ethereum
    case base.id: return '/logos/base.png' // Base
    case arbitrum.id: return '/logos/arbitrum.png' // Arbitrum
    case optimism.id: return '/logos/op.png' // OP Mainnet
    case polygon.id: return '/logos/polygon.png' // Polygon
    case bsc.id: return '/logos/bnbchain.png' // BNB Smart Chain
    case sepolia.id: return '/logos/ethereum.png' // Sepolia (use Ethereum logo)
    case polygonMumbai.id: return '/logos/polygon.png' // Mumbai (use Polygon logo)
    case solanaMainnet.id: return '/globe.svg' // Solana (no logo provided, use globe)
    case solanaDevnet.id: return '/globe.svg' // Solana Devnet (no logo provided, use globe)
    case stellarMainnet.id: return '/globe.svg' // Stellar (no logo provided, use globe)
    case stellarTestnet.id: return '/globe.svg' // Stellar Testnet (no logo provided, use globe)
    default: return '/globe.svg' // Default fallback
  }
}

// Currently supported chains for payin/payout (USDC only)
// Sepolia, Base, Arbitrum, Optimism, Polygon, Stellar Mainnet, Stellar Testnet
export const supportedChains: SupportedChain[] = [
  {
    ...sepolia,
    logo: getChainLogo(sepolia.id),
    usdcAddress: USDC_ADDRESSES[sepolia.id],
    explorerUrl: 'https://sepolia.etherscan.io',
    ecosystem: 'EVM',
  },
  {
    ...base,
    logo: getChainLogo(base.id),
    usdcAddress: USDC_ADDRESSES[base.id],
    explorerUrl: 'https://basescan.org',
    ecosystem: 'EVM',
  },
  {
    ...arbitrum,
    logo: getChainLogo(arbitrum.id),
    usdcAddress: USDC_ADDRESSES[arbitrum.id],
    explorerUrl: 'https://arbiscan.io',
    ecosystem: 'EVM',
  },
  {
    ...optimism,
    logo: getChainLogo(optimism.id),
    usdcAddress: USDC_ADDRESSES[optimism.id],
    explorerUrl: 'https://optimistic.etherscan.io',
    ecosystem: 'EVM',
  },
  {
    ...polygon,
    logo: getChainLogo(polygon.id),
    usdcAddress: USDC_ADDRESSES[polygon.id],
    explorerUrl: 'https://polygonscan.com',
    ecosystem: 'EVM',
  },
  {
    ...stellarMainnet,
    logo: getChainLogo(stellarMainnet.id),
    explorerUrl: 'https://stellar.expert/explorer/public',
    ecosystem: 'Stellar',
  },
  {
    ...stellarTestnet,
    logo: getChainLogo(stellarTestnet.id),
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    ecosystem: 'Stellar',
  },
]

// All chains (for future expansion) - currently hidden
export const allChains: SupportedChain[] = [
  // EVM Chains (payin supported)
  {
    ...mainnet,
    logo: getChainLogo(mainnet.id),
    usdcAddress: USDC_ADDRESSES[mainnet.id],
    explorerUrl: 'https://etherscan.io',
    ecosystem: 'EVM',
  },
  {
    ...sepolia,
    logo: getChainLogo(sepolia.id),
    usdcAddress: USDC_ADDRESSES[sepolia.id],
    explorerUrl: 'https://sepolia.etherscan.io',
    ecosystem: 'EVM',
  },
  {
    ...base,
    logo: getChainLogo(base.id),
    usdcAddress: USDC_ADDRESSES[base.id],
    explorerUrl: 'https://basescan.org',
    ecosystem: 'EVM',
  },
  {
    ...arbitrum,
    logo: getChainLogo(arbitrum.id),
    usdcAddress: USDC_ADDRESSES[arbitrum.id],
    explorerUrl: 'https://arbiscan.io',
    ecosystem: 'EVM',
  },
  {
    ...optimism,
    logo: getChainLogo(optimism.id),
    usdcAddress: USDC_ADDRESSES[optimism.id],
    explorerUrl: 'https://optimistic.etherscan.io',
    ecosystem: 'EVM',
  },
  {
    ...polygon,
    logo: getChainLogo(polygon.id),
    usdcAddress: USDC_ADDRESSES[polygon.id],
    explorerUrl: 'https://polygonscan.com',
    ecosystem: 'EVM',
  },
  {
    ...bsc,
    logo: getChainLogo(bsc.id),
    usdcAddress: USDC_ADDRESSES[bsc.id],
    explorerUrl: 'https://bscscan.com',
    ecosystem: 'EVM',
  },
  {
    ...polygonMumbai,
    logo: getChainLogo(polygonMumbai.id),
    usdcAddress: USDC_ADDRESSES[polygonMumbai.id],
    explorerUrl: 'https://mumbai.polygonscan.com',
    ecosystem: 'EVM',
  },
  // Non-EVM Chains (payin supported)
  {
    ...solanaMainnet,
    logo: getChainLogo(solanaMainnet.id),
    explorerUrl: 'https://explorer.solana.com',
    ecosystem: 'Solana',
  },
  {
    ...solanaDevnet,
    logo: getChainLogo(solanaDevnet.id),
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    ecosystem: 'Solana',
  },
  {
    ...stellarMainnet,
    logo: getChainLogo(stellarMainnet.id),
    explorerUrl: 'https://stellar.expert/explorer/public',
    ecosystem: 'Stellar',
  },
  {
    ...stellarTestnet,
    logo: getChainLogo(stellarTestnet.id),
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    ecosystem: 'Stellar',
  },
]

// Get only EVM chains for wagmi configuration
export const getEvmChains = (): SupportedChain[] => {
  return supportedChains.filter(chain => chain.ecosystem === 'EVM')
}

// Get non-EVM chains
export const getNonEvmChains = (): SupportedChain[] => {
  return supportedChains.filter(chain => chain.ecosystem !== 'EVM')
}

export const getChainById = (chainId: number): SupportedChain | undefined => {
  return supportedChains.find(chain => chain.id === chainId)
}

export const getChainByName = (name: string): SupportedChain | undefined => {
  return supportedChains.find(chain => 
    chain.name.toLowerCase() === name.toLowerCase()
  )
}

// Check if chain is EVM compatible
export const isEvmChain = (chainId: number): boolean => {
  const chain = getChainById(chainId)
  return chain?.ecosystem === 'EVM' || false
}

// RPC configuration for EVM chains
export const getRpcUrl = (chainId: number): string => {
  const envKey = (() => {
    switch (chainId) {
      case mainnet.id: return 'NEXT_PUBLIC_ETHEREUM_RPC_URL'
      case sepolia.id: return 'NEXT_PUBLIC_SEPOLIA_RPC_URL'
      case base.id: return 'NEXT_PUBLIC_BASE_RPC_URL'
      case arbitrum.id: return 'NEXT_PUBLIC_ARBITRUM_RPC_URL'
      case optimism.id: return 'NEXT_PUBLIC_OPTIMISM_RPC_URL'
      case polygon.id: return 'NEXT_PUBLIC_POLYGON_RPC_URL'
      case bsc.id: return 'NEXT_PUBLIC_BSC_RPC_URL'
      case polygonMumbai.id: return 'NEXT_PUBLIC_MUMBAI_RPC_URL'
      default: return null
    }
  })()

  if (envKey && process.env[envKey]) {
    return process.env[envKey]!
  }

  // Fallback to public RPCs (rate limited)
  const chain = supportedChains.find(c => c.id === chainId)
  return chain?.rpcUrls.default.http[0] || ''
}