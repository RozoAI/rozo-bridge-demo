'use client'

import { useState } from 'react'
import { ChevronDown, LogOut, AlertTriangle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { cn } from '@/lib/utils'
import { useStellarWalletConnection, getAvailableStellarWallets } from '@/store/stellar'
import { STELLAR_WALLETS, StellarNetwork } from '@/lib/stellar'

interface StellarWalletConnectProps {
  className?: string
}

export function StellarWalletConnect({ className }: StellarWalletConnectProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  
  const {
    isConnected,
    publicKey,
    walletId,
    network,
    error,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
  } = useStellarWalletConnection()

  const availableWallets = getAvailableStellarWallets()

  const handleConnect = async (selectedWalletId: string) => {
    try {
      await connect(selectedWalletId)
      setShowConnectDialog(false)
    } catch (error) {
      console.error('Failed to connect Stellar wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect Stellar wallet:', error)
    }
  }

  const handleSwitchNetwork = async (targetNetwork: StellarNetwork) => {
    if (targetNetwork !== network) {
      await switchNetwork(targetNetwork)
    }
  }

  const formatStellarAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey)
      } catch (error) {
        console.warn('Failed to copy Stellar address:', error)
      }
    }
  }

  const getWalletIcon = (walletId: string) => {
    const wallet = STELLAR_WALLETS.find(w => w.id === walletId)
    return wallet?.icon || '⭐'
  }

  const getWalletName = (walletId: string) => {
    const wallet = STELLAR_WALLETS.find(w => w.id === walletId)
    return wallet?.name || 'Unknown Wallet'
  }

  if (!isConnected) {
    return (
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className={cn('flex items-center gap-2', className)}>
            <Star className="h-4 w-4" />
            Connect Stellar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Stellar Wallet</DialogTitle>
            <DialogDescription>
              Choose a Stellar wallet to connect for cross-chain bridging
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {availableWallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
                    {wallet.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {wallet.id === 'walletconnect' && 'Mobile wallets (LOBSTR, etc.)'}
                      {wallet.id === 'freighter' && 'Browser extension'}
                      {wallet.id === 'xbull' && 'Extension & web wallet'}
                    </div>
                  </div>
                  {!wallet.installed && wallet.id !== 'walletconnect' && (
                    <Badge variant="secondary" className="text-xs">
                      Not Installed
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center mt-4">
            <p>Stellar wallets support XLM and Stellar assets</p>
            <p>Network: {network === 'PUBLIC' ? 'Mainnet' : 'Testnet'}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('flex items-center gap-2', className)}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
              {getWalletIcon(walletId!)}
            </div>
            <span className="font-mono">{formatStellarAddress(publicKey!)}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Account Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Stellar Connected</div>
              <div className="text-xs text-muted-foreground">
                {getWalletName(walletId!)}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {formatStellarAddress(publicKey!)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              📋
            </Button>
          </div>
        </div>

        {/* Network Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">
                Stellar {network === 'PUBLIC' ? 'Mainnet' : 'Testnet'}
              </span>
            </div>
          </div>
        </div>

        {/* Network Switch Options */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Switch Network
          </div>
          {(['PUBLIC', 'TESTNET'] as StellarNetwork[]).map((targetNetwork) => {
            const isCurrentNetwork = targetNetwork === network
            const networkName = targetNetwork === 'PUBLIC' ? 'Mainnet' : 'Testnet'
            
            return (
              <DropdownMenuItem
                key={targetNetwork}
                onClick={() => handleSwitchNetwork(targetNetwork)}
                disabled={isCurrentNetwork}
                className="flex items-center gap-2 px-2 py-2"
              >
                <Star className="w-4 h-4 text-purple-500" />
                <span className="flex-1">Stellar {networkName}</span>
                {isCurrentNetwork && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
