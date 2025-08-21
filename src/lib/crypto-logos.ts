/**
 * Crypto logo utilities for chain and token logos
 * Uses local PNG files and globe.svg for fallbacks
 */

// Chain logo mappings to local files
const CHAIN_LOGO_MAP: Record<number, string> = {
  1: '/logos/ethereum.png', // Ethereum Mainnet
  11155111: '/logos/ethereum.png', // Sepolia Testnet (use Ethereum logo)
  8453: '/logos/base.png', // Base
  42161: '/logos/arbitrum.png', // Arbitrum
  10: '/logos/op.png', // Optimism
  137: '/logos/polygon.png', // Polygon
  56: '/logos/bnbchain.png', // BSC - Binance Smart Chain
  80001: '/logos/polygon.png', // Mumbai Testnet (use Polygon logo)
  900: '/globe.svg', // Solana Mainnet (no logo provided, use globe)
  901: '/globe.svg', // Solana Devnet (no logo provided, use globe)
  1500: '/globe.svg', // Stellar Mainnet (no logo provided, use globe)
  1501: '/globe.svg', // Stellar Testnet (no logo provided, use globe)
}

// Token logo mappings to local files
const TOKEN_LOGO_MAP: Record<string, string> = {
  'USDC': '/logos/USDC.png',
  'USDT': '/globe.svg', // No logo provided, use globe
  'ETH': '/logos/ethereum.png',
  'WETH': '/logos/ethereum.png', // WETH uses ETH logo
  'MATIC': '/logos/polygon.png',
  'ARB': '/logos/arbitrum.png',
  'OP': '/logos/op.png',
  'BNB': '/logos/bnbchain.png',
  'SOL': '/globe.svg', // No logo provided, use globe
  'XLM': '/globe.svg', // No logo provided, use globe
  'DAI': '/globe.svg', // No logo provided, use globe
  'WBTC': '/globe.svg', // No logo provided, use globe
}

// Alternative symbols for some tokens
const TOKEN_SYMBOL_ALIASES: Record<string, string> = {
  'WETH': 'ETH',
  'WMATIC': 'MATIC',
  'WBNB': 'BNB',
}

/**
 * Get chain logo URL
 */
export function getChainLogoUrl(chainId: number): string {
  return CHAIN_LOGO_MAP[chainId] || '/globe.svg'
}

/**
 * Get token logo URL
 */
export function getTokenLogoUrl(symbol: string): string {
  const normalizedSymbol = symbol.toUpperCase()
  const aliasedSymbol = TOKEN_SYMBOL_ALIASES[normalizedSymbol] || normalizedSymbol
  return TOKEN_LOGO_MAP[aliasedSymbol] || '/globe.svg'
}

/**
 * Generate fallback logo as data URI (for cases where we need a programmatic fallback)
 */
export function generateFallbackLogo(text: string, chainId?: number): string {
  const colors = getChainColors(chainId || 0)
  const initial = getChainInitial(chainId || 0)
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#grad)" />
      <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
            text-anchor="middle" fill="white">
        ${initial}
      </text>
    </svg>
  `)}`
}

/**
 * Get chain colors for gradient
 */
function getChainColors(chainId: number): { from: string; to: string } {
  const colorMap: Record<number, { from: string; to: string }> = {
    1: { from: '#627EEA', to: '#8A92B2' }, // Ethereum blue
    11155111: { from: '#627EEA', to: '#8A92B2' }, // Sepolia (Ethereum colors)
    8453: { from: '#0052FF', to: '#4285F4' }, // Base blue
    42161: { from: '#28A0F0', to: '#1E88E5' }, // Arbitrum blue
    10: { from: '#FF0420', to: '#FF6B6B' }, // Optimism red
    137: { from: '#8247E5', to: '#B565A7' }, // Polygon purple
    56: { from: '#F3BA2F', to: '#FDD835' }, // BSC yellow
    80001: { from: '#8247E5', to: '#B565A7' }, // Mumbai (Polygon colors)
    900: { from: '#9945FF', to: '#14F195' }, // Solana gradient
    901: { from: '#9945FF', to: '#14F195' }, // Solana Devnet
    1500: { from: '#000000', to: '#4A4A4A' }, // Stellar black/gray
    1501: { from: '#000000', to: '#4A4A4A' }, // Stellar Testnet
  }
  
  return colorMap[chainId] || { from: '#6366F1', to: '#8B5CF6' }
}

/**
 * Get token colors for gradient
 */
function getTokenColors(symbol: string): { from: string; to: string } {
  const colorMap: Record<string, { from: string; to: string }> = {
    'USDC': { from: '#2775CA', to: '#4F9EEA' }, // USDC blue
    'USDT': { from: '#26A17B', to: '#4CAF50' }, // USDT green
    'ETH': { from: '#627EEA', to: '#8A92B2' }, // Ethereum blue
    'MATIC': { from: '#8247E5', to: '#B565A7' }, // Polygon purple
    'ARB': { from: '#28A0F0', to: '#1E88E5' }, // Arbitrum blue
    'OP': { from: '#FF0420', to: '#FF6B6B' }, // Optimism red
    'BNB': { from: '#F3BA2F', to: '#FDD835' }, // BNB yellow
    'SOL': { from: '#9945FF', to: '#14F195' }, // Solana gradient
    'XLM': { from: '#000000', to: '#4A4A4A' }, // Stellar black/gray
  }
  
  return colorMap[symbol.toUpperCase()] || { from: '#6366F1', to: '#8B5CF6' }
}

/**
 * Get chain initial letter
 */
function getChainInitial(chainId: number): string {
  const initialMap: Record<number, string> = {
    1: 'E', // Ethereum Mainnet
    11155111: 'S', // Sepolia Testnet
    8453: 'B', // Base
    42161: 'A', // Arbitrum
    10: 'O', // Optimism
    137: 'P', // Polygon
    56: 'B', // BSC
    80001: 'M', // Mumbai Testnet
    900: 'S', // Solana Mainnet
    901: 'S', // Solana Devnet
    1500: 'S', // Stellar Mainnet
    1501: 'S', // Stellar Testnet
  }
  
  return initialMap[chainId] || '?'
}

/**
 * Preload logo images for better performance
 */
export function preloadCryptoLogos(chainIds: number[], tokenSymbols: string[] = ['USDC']) {
  if (typeof window === 'undefined') return // Skip on server
  
  // Preload chain logos
  chainIds.forEach(chainId => {
    const logoUrl = getChainLogoUrl(chainId)
    if (logoUrl && !logoUrl.startsWith('data:')) {
      const img = new Image()
      img.src = logoUrl
    }
  })
  
  // Preload token logos
  tokenSymbols.forEach(symbol => {
    const logoUrl = getTokenLogoUrl(symbol)
    if (logoUrl && !logoUrl.startsWith('data:')) {
      const img = new Image()
      img.src = logoUrl
    }
  })
}