"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, Star, Wallet } from "lucide-react";
import { toast } from "sonner";

interface StellarWalletConnectProps {
  className?: string;
}

export function StellarWalletConnect({ className }: StellarWalletConnectProps) {
  const {
    stellarAddress,
    stellarConnected,
    stellarConnecting,
    connectStellarWallet,
    disconnectStellarWallet,
  } = useStellarWallet();

  const handleConnect = async () => {
    try {
      await connectStellarWallet();
    } catch (error) {
      console.error("Failed to connect Stellar wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnectStellarWallet();
      toast.success("Stellar wallet disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect Stellar wallet:", error);
      toast.error("Failed to disconnect wallet. Please try again.");
    }
  };

  const formatStellarAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (stellarAddress) {
      try {
        await navigator.clipboard.writeText(stellarAddress);
        toast.success("Stellar address copied to clipboard");
      } catch (error) {
        console.warn("Failed to copy Stellar address:", error);
      }
    }
  };

  if (!stellarConnected) {
    return (
      <Button
        variant="outline"
        className={cn("flex items-center gap-2", className)}
        onClick={handleConnect}
        disabled={stellarConnecting}
      >
        <Wallet className="size-4" />
        {stellarConnecting ? "Connecting..." : "Connect Stellar"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("flex items-center gap-2", className)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
              ⭐
            </div>
            <span className="font-mono">
              {formatStellarAddress(stellarAddress)}
            </span>
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
                Stellar Wallet
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {formatStellarAddress(stellarAddress)}
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
              <span className="text-sm font-medium">Stellar Mainnet</span>
            </div>
          </div>
        </div>

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
