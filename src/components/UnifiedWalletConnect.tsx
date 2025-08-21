'use client'

import { useState } from 'react'
import { Wallet, ChevronDown } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { WalletConnect } from './WalletConnect'
import { StellarWalletConnect } from './StellarWalletConnect'
import { useAccount } from 'wagmi'
import { useStellarWalletConnection } from '@/store/stellar'

interface UnifiedWalletConnectProps {
  className?: string
  preferredChain?: 'evm' | 'stellar'
}

export function UnifiedWalletConnect({ 
  className, 
  preferredChain = 'evm' 
}: UnifiedWalletConnectProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [activeTab, setActiveTab] = useState(preferredChain)
  
  const { isConnected: evmConnected, address: evmAddress } = useAccount()
  const { isConnected: stellarConnected, publicKey: stellarAddress } = useStellarWalletConnection()

  const hasAnyConnection = evmConnected || stellarConnected

  if (hasAnyConnection) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('flex items-center gap-2', className)}>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">
                {evmConnected && stellarConnected 
                  ? 'Multi-Chain' 
                  : evmConnected 
                    ? 'EVM Connected' 
                    : 'Stellar Connected'
                }
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-3 border-b">
            <div className="font-medium mb-2">Connected Wallets</div>
            
            {evmConnected && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <span className="text-sm">EVM: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}</span>
              </div>
            )}
            
            {stellarConnected && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-sm">Stellar: {stellarAddress?.slice(0, 6)}...{stellarAddress?.slice(-4)}</span>
              </div>
            )}
          </div>

          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Manage Connections
            </div>
            
            {!evmConnected && (
              <DropdownMenuItem onClick={() => setShowConnectDialog(true)}>
                Connect EVM Wallet
              </DropdownMenuItem>
            )}
            
            {!stellarConnected && (
              <DropdownMenuItem onClick={() => setShowConnectDialog(true)}>
                Connect Stellar Wallet
              </DropdownMenuItem>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Individual wallet controls */}
          <div className="p-2 space-y-1">
            {evmConnected && (
              <div className="p-2 bg-muted/50 rounded-lg">
                <WalletConnect className="w-full" />
              </div>
            )}
            
            {stellarConnected && (
              <div className="p-2 bg-muted/50 rounded-lg">
                <StellarWalletConnect className="w-full" />
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
      <DialogTrigger asChild>
        <Button className={cn('flex items-center gap-2', className)}>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose between EVM chains (Ethereum, Base, etc.) or Stellar network
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evm" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              EVM Chains
            </TabsTrigger>
            <TabsTrigger value="stellar" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              Stellar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="evm" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connect to Ethereum, Base, Polygon, Arbitrum, Optimism, or Avalanche
            </div>
            <WalletConnect className="w-full" />
          </TabsContent>
          
          <TabsContent value="stellar" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connect to Stellar network for XLM and Stellar asset transfers
            </div>
            <StellarWalletConnect className="w-full" />
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">Multi-Chain Bridge</p>
          <p>You can connect both EVM and Stellar wallets for seamless cross-chain transfers</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}


