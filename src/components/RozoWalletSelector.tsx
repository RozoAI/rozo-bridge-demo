'use client'

import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { ChevronDown, LogOut, Star, Globe, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getChainById } from '@/lib/chains'
import { useStellarWalletConnection } from '@/store/stellar'
import { StellarNetwork } from '@/lib/stellar'
import { cn } from '@/lib/utils'

interface RozoWalletSelectorProps {
  className?: string
}

export function RozoWalletSelector({ className }: RozoWalletSelectorProps) {
  // EVM wallet state
  const { address, isConnected: isEVMConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  // Stellar wallet state
  const {
    isConnected: isStellarConnected,
    publicKey,
    network,
    disconnect: disconnectStellar,
    switchNetwork,
  } = useStellarWalletConnection()

  const currentChain = getChainById(chainId)

  const isConnected = isEVMConnected || isStellarConnected
  const currentWalletType = isEVMConnected ? 'EVM' : isStellarConnected ? 'Stellar' : null

  // Wallet handlers
  const handleDisconnectEVM = () => {
    disconnect()
  }

  const handleDisconnectStellar = async () => {
    try {
      await disconnectStellar()
    } catch (error) {
      console.error('Failed to disconnect Stellar wallet:', error)
    }
  }

  const handleSwitchStellarNetwork = async (targetNetwork: StellarNetwork) => {
    if (targetNetwork !== network) {
      await switchNetwork(targetNetwork)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    const addressToCopy = isEVMConnected ? address : publicKey
    if (addressToCopy) {
      try {
        await navigator.clipboard.writeText(addressToCopy)
      } catch (error) {
        console.warn('Failed to copy address:', error)
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="flex gap-2">
        <Button className={cn('flex items-center gap-2', className)}>
          <CreditCard className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('flex items-center gap-2', className)}>
          {currentWalletType === 'EVM' ? (
            <>
              <Globe className="h-4 w-4" />
              {currentChain?.name || 'EVM Chain'}
            </>
          ) : (
            <>
              <Star className="h-4 w-4" />
              Stellar {network}
            </>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        {/* Wallet Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <span className="text-sm font-medium">
                {currentWalletType === 'EVM'
                  ? (currentChain?.name || 'Unknown Chain')
                  : `Stellar ${network}`
                }
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentWalletType}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              {currentWalletType === 'EVM'
                ? `Chain ID: ${currentChain?.id}`
                : `Address: ${formatAddress(publicKey || '')}`
              }
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-6 w-6 p-0"
            >
              📋
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Quick Actions
          </div>
          
          <DropdownMenuItem className="flex items-center gap-2 px-2 py-2">
            <CreditCard className="h-4 w-4" />
            <span>Use Bridge Form Below</span>
          </DropdownMenuItem>
        </div>

        {/* Chain Switch Options */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Switch Network
          </div>

          {/* EVM Chains */}
          {currentWalletType === 'EVM' && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2">
                <Globe className="h-4 w-4" />
                <span>EVM Chains</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {[1, 137, 42161, 10, 8453, 43114].map((targetChainId) => {
                  const chain = getChainById(targetChainId)
                  if (!chain) return null

                  const isCurrentChain = targetChainId === chainId

                  return (
                    <DropdownMenuItem
                      key={targetChainId}
                      disabled={isCurrentChain}
                      className="flex items-center gap-2 px-2 py-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      <span className="flex-1 text-sm">{chain.name}</span>
                      {isCurrentChain && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Stellar Networks */}
          {currentWalletType === 'Stellar' && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2">
                <Star className="h-4 w-4" />
                <span>Stellar Networks</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {['mainnet', 'testnet'].map((targetNetwork) => {
                  const isCurrentNetwork = targetNetwork === network

                  return (
                    <DropdownMenuItem
                      key={targetNetwork}
                      onClick={() => handleSwitchStellarNetwork(targetNetwork as StellarNetwork)}
                      disabled={isCurrentNetwork}
                      className="flex items-center gap-2 px-2 py-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                      <span className="flex-1 text-sm capitalize">{targetNetwork}</span>
                      {isCurrentNetwork && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={currentWalletType === 'EVM' ? handleDisconnectEVM : handleDisconnectStellar}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect {currentWalletType} Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
