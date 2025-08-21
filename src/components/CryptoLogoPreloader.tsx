'use client'

import { useEffect } from 'react'
import { preloadCryptoLogos } from '@/lib/crypto-logos'
import { supportedChains } from '@/lib/chains'

/**
 * Component to preload cryptocurrency logos for better performance
 */
export function CryptoLogoPreloader() {
  useEffect(() => {
    // Preload all supported chain logos and common token logos
    const chainIds = supportedChains.map(chain => chain.id)
    const tokenSymbols = ['USDC', 'ETH', 'WETH', 'MATIC', 'ARB', 'OP', 'BNB']
    
    preloadCryptoLogos(chainIds, tokenSymbols)
  }, [])

  // This component doesn't render anything
  return null
}

/**
 * Hook to preload specific crypto logos
 */
export function usePreloadCryptoLogos(chainIds: number[], tokenSymbols: string[] = []) {
  useEffect(() => {
    if (chainIds.length > 0 || tokenSymbols.length > 0) {
      preloadCryptoLogos(chainIds, tokenSymbols)
    }
  }, [chainIds, tokenSymbols])
}
