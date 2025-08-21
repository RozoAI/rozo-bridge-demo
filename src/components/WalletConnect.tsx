'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Wallet, ChevronDown, LogOut, AlertTriangle } from 'lucide-react'
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
import { getChainById } from '@/lib/chains'
import { trackWalletConnect, trackChainSwitch } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface WalletConnectProps {
  className?: string
}

export function WalletConnect({ className }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  const currentChain = getChainById(chainId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true)
      await connect({ connector })
      setShowConnectDialog(false)
      trackWalletConnect(connector.name, chainId)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleSwitchChain = (targetChainId: number) => {
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId as Parameters<typeof switchChain>[0]['chainId'] })
      trackChainSwitch(chainId, targetChainId)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
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
              Choose a wallet to connect to the bridge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => handleConnect(connector)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {connector.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {connector.name === 'WalletConnect' && 'Scan with mobile wallet'}
                      {connector.name === 'Coinbase Wallet' && 'Connect with Coinbase'}
                      {connector.name === 'Injected' && 'Browser extension'}
                    </div>
                  </div>
                </div>
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="font-mono">{formatAddress(address!)}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Account Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Connected</div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatAddress(address!)}
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

        {/* Chain Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <span className="text-sm font-medium">
                {currentChain?.name || 'Unknown Chain'}
              </span>
            </div>
            {isSwitchingChain && (
              <Badge variant="secondary" className="text-xs">
                Switching...
              </Badge>
            )}
          </div>
          {currentChain && (
            <div className="text-xs text-muted-foreground mt-1">
              Chain ID: {currentChain.id}
            </div>
          )}
        </div>

        {/* Chain Switch Options */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Switch Network
          </div>
          {[1, 137, 42161, 10, 8453, 43114].map((targetChainId) => {
            const chain = getChainById(targetChainId)
            if (!chain) return null
            
            const isCurrentChain = targetChainId === chainId
            
            return (
              <DropdownMenuItem
                key={targetChainId}
                onClick={() => handleSwitchChain(targetChainId)}
                disabled={isCurrentChain || isSwitchingChain}
                className="flex items-center gap-2 px-2 py-2"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <span className="flex-1">{chain.name}</span>
                {isCurrentChain && (
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

// Chain Switch Prompt Component
interface ChainSwitchPromptProps {
  requiredChainId: number
  currentChainId: number
  onSwitch: () => void
  onCancel: () => void
}

export function ChainSwitchPrompt({
  requiredChainId,
  currentChainId,
  onSwitch,
  onCancel,
}: ChainSwitchPromptProps) {
  const requiredChain = getChainById(requiredChainId)
  const currentChain = getChainById(currentChainId)

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-3">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Switch Network Required</span>
      </div>
      <p className="text-sm text-yellow-700 dark:text-yellow-500 mb-4">
        You need to switch from <strong>{currentChain?.name}</strong> to{' '}
        <strong>{requiredChain?.name}</strong> to continue with this transaction.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSwitch} className="flex-1">
          Switch to {requiredChain?.name}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
