'use client'

import { useEffect } from 'react'
import { setupCryptoPolyfill } from '@/utils/polyfills'

export function CryptoPolyfillSetup() {
  useEffect(() => {
    setupCryptoPolyfill()
  }, [])
  
  return null
}