'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Wallet, ChevronDown, LogOut, Star, Globe, Zap } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getChainById } from '@/lib/chains'
import { useStellarWalletConnection, getAvailableStellarWallets } from '@/store/stellar'
import { STELLAR_WALLETS, StellarNetwork } from '@/lib/stellar'
import { cn } from '@/lib/utils'

interface UnifiedChainSelectorProps {
  className?: string
}

export function UnifiedChainSelector({ className }: UnifiedChainSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  
  // EVM wallet state
  const { address, isConnected: isEVMConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // Stellar wallet state
  const {
    isConnected: isStellarConnected,
    publicKey,
    walletId,
    network,
    error,
    isConnecting: isStellarConnecting,
    connect: connectStellar,
    disconnect: disconnectStellar,
    switchNetwork,
  } = useStellarWalletConnection()

  const currentChain = getChainById(chainId)
  const availableStellarWallets = getAvailableStellarWallets()

  const isConnected = isEVMConnected || isStellarConnected
  const currentWalletType = isEVMConnected ? 'EVM' : isStellarConnected ? 'Stellar' : null

  // EVM wallet handlers
  const handleConnectEVM = async (connector: any) => {
    try {
      setIsConnecting(true)
      await connect({ connector })
      setShowConnectDialog(false)
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectEVM = () => {
    disconnect()
  }

  const handleSwitchChain = (targetChainId: number) => {
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId as Parameters<typeof switchChain>[0]['chainId'] })
    }
  }

  // Stellar wallet handlers
  const handleConnectStellar = async (selectedWalletId: string) => {
    try {
      await connectStellar(selectedWalletId)
      setShowConnectDialog(false)
    } catch (error) {
      console.error('Failed to connect Stellar wallet:', error)
    }
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
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogTrigger asChild>
          <Button className={cn('flex items-center gap-2', className)}>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet type and connect to start bridging
            </DialogDescription>
          </DialogHeader>
          
          {/* EVM Wallets */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">EVM Wallets</div>
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleConnectEVM(connector)}
                disabled={isConnecting}
              >
                <Globe className="h-4 w-4 mr-2" />
                {connector.name}
              </Button>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="text-sm font-medium text-muted-foreground mb-3">Stellar Wallets</div>
            {availableStellarWallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleConnectStellar(wallet.id)}
                disabled={isStellarConnecting}
              >
                <Star className="h-4 w-4 mr-2" />
                {wallet.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
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

        {/* Chain Switch Options */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Switch Network
          </div>
          
          {/* EVM Chains */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2">
              <Globe className="h-4 w-4" />
              <span>EVM Chains</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {[1, 137, 42161, 10, 8453, 43114].map((targetChainId) => {
                const chain = getChainById(targetChainId)
                if (!chain) return null
                
                const isCurrentChain = targetChainId === chainId && currentWalletType === 'EVM'
                
                return (
                  <DropdownMenuItem
                    key={targetChainId}
                    onClick={() => handleSwitchChain(targetChainId)}
                    disabled={isCurrentChain || isSwitchingChain}
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

          {/* Stellar Networks */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2">
              <Star className="h-4 w-4" />
              <span>Stellar Networks</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {['mainnet', 'testnet'].map((targetNetwork) => {
                const isCurrentNetwork = targetNetwork === network && currentWalletType === 'Stellar'
                
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
