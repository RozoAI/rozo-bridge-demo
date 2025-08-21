import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, bsc, sepolia, polygonMumbai, linea, celo, mantle } from 'wagmi/chains'
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work properly.')
}

// World Chain definition (if not available in wagmi/chains)
const worldChain = {
  id: 480,
  name: 'World Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: { name: 'World Chain Explorer', url: 'https://worldchain-mainnet.explorer.alchemy.com' },
  },
} as const

// All chains required by Rozo Pay (must include all for RozoPayProvider to work)
const requiredChains = [
  mainnet,        // Ethereum
  base,           // Base
  polygon,        // Polygon
  optimism,       // OP Mainnet
  arbitrum,       // Arbitrum One
  linea,          // Linea Mainnet
  bsc,            // BNB Smart Chain
  sepolia,        // Sepolia
  worldChain,     // World Chain
  mantle,         // Mantle
  celo,           // Celo
] as const

// EVM chains supported by payin service (subset of required chains)
const payinSupportedChains = [
  mainnet,        // Ethereum Mainnet (1)
  sepolia,        // Sepolia Testnet (11155111)
  base,           // Base (8453)
  arbitrum,       // Arbitrum (42161)
  optimism,       // Optimism (10)
  polygon,        // Polygon (137)
  bsc,            // BSC - Binance Smart Chain (56)
  polygonMumbai,  // Mumbai Testnet (80001)
] as const

// Configure connectors
const connectors = [
  injected(),
  walletConnect({
    projectId: projectId || 'dummy-project-id',
    metadata: {
      name: 'Rozo Bridge Demo',
      description: 'Multi-chain USDC bridge powered by Intent Pay',
      url: 'https://bridge.rozo.ai',
      icons: ['https://bridge.rozo.ai/icon.png']
    },
    showQrModal: true,
  }),
  coinbaseWallet({
    appName: 'Rozo Bridge Demo',
    appLogoUrl: 'https://bridge.rozo.ai/icon.png',
    preference: 'smartWalletOnly',
  }),
]

// Configure transports for each chain
const transports = requiredChains.reduce((acc, chain) => {
  acc[chain.id] = http()
  return acc
}, {} as Record<number, ReturnType<typeof http>>)

// Create wagmi config with all required chains for RozoPayProvider
export const config = createConfig({
  chains: requiredChains,
  connectors,
  transports,
  ssr: true,
})

// Export payin supported chains for filtering in UI
export const getPayinSupportedChainIds = (): number[] => {
  return payinSupportedChains.map(chain => chain.id)
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}