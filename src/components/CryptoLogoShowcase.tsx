'use client'

import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTokenLogoUrl } from '@/lib/crypto-logos'
import { supportedChains } from '@/lib/chains'

/**
 * Showcase component to display all crypto logos
 * This can be used for testing or as a visual reference
 */
export function CryptoLogoShowcase() {
  const tokens = ['USDC', 'USDT', 'ETH', 'WETH', 'MATIC', 'AVAX', 'OP', 'ARB']

  return (
    <div className="space-y-6">
      {/* Chain Logos */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Chain Logos</CardTitle>
          <CardDescription>
            Logos fetched from CryptoLogos.cc for supported blockchain networks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {supportedChains.map((chain) => (
              <div key={chain.id} className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                <Image
                  src={chain.logo}
                  alt={chain.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                  onError={() => {
                    console.log(`Failed to load logo for ${chain.name}:`, chain.logo)
                  }}
                />
                <div className="text-center">
                  <div className="font-medium text-sm">{chain.name}</div>
                  <Badge variant="outline" className="text-xs">
                    ID: {chain.id}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token Logos */}
      <Card>
        <CardHeader>
          <CardTitle>Token Logos</CardTitle>
          <CardDescription>
            Common cryptocurrency token logos from CryptoLogos.cc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {tokens.map((symbol) => (
              <div key={symbol} className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                <Image
                  src={getTokenLogoUrl(symbol)}
                  alt={symbol}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  onError={() => {
                    console.log(`Failed to load logo for ${symbol}:`, getTokenLogoUrl(symbol))
                  }}
                />
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {symbol}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logo URLs for Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Logo URLs Reference</CardTitle>
          <CardDescription>
            Direct URLs to the crypto logos for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Chain Logo URLs:</h4>
              <div className="space-y-1 text-sm font-mono">
                {supportedChains.map((chain) => (
                  <div key={chain.id} className="flex gap-2">
                    <span className="w-20">{chain.name}:</span>
                    <a 
                      href={chain.logo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {chain.logo}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Token Logo URLs:</h4>
              <div className="space-y-1 text-sm font-mono">
                {tokens.map((symbol) => (
                  <div key={symbol} className="flex gap-2">
                    <span className="w-20">{symbol}:</span>
                    <a 
                      href={getTokenLogoUrl(symbol)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {getTokenLogoUrl(symbol)}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
