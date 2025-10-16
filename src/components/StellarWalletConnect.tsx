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
import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Stellar } from "./icons/chains";

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
    stellarWalletName,
    trustlineStatus,
    xlmBalance,
    createTrustline,
    checkXlmBalance,
    checkTrustline,
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

  const handleCreateTrustline = async () => {
    try {
      await createTrustline();
    } catch (error) {
      console.error("Failed to create trustline:", error);
    }
  };

  const handleRefreshBalances = async () => {
    try {
      await Promise.all([checkXlmBalance(), checkTrustline()]);
      toast.success("Balances refreshed");
    } catch (error) {
      console.error("Failed to refresh balances:", error);
      toast.error("Failed to refresh balances");
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
            <Wallet className="size-4" />
            <span className="font-mono">
              {formatStellarAddress(stellarAddress)}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* Account Info */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Stellar Connected</div>
              <div className="text-sm text-muted-foreground font-mono mt-1 font-medium">
                {formatStellarAddress(stellarAddress)}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {stellarWalletName}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalances}
                className="h-8 w-8 p-0"
                disabled={xlmBalance.checking || trustlineStatus.checking}
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    (xlmBalance.checking || trustlineStatus.checking) &&
                      "animate-spin"
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="p-3 border-b space-y-3">
          {/* XLM Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stellar className="size-[20px] rounded-full" />
              <span className="text-sm font-medium">XLM</span>
            </div>
            <span className="text-sm font-mono">
              {xlmBalance.checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `${Number(xlmBalance.balance).toFixed(2)} XLM`
              )}
            </span>
          </div>

          {/* USDC Trustline Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/usdc.svg" alt="USDC" width={20} height={20} />
                <span className="text-sm font-medium">USDC</span>
              </div>
              {trustlineStatus.checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : trustlineStatus.exists ? (
                <span className="text-sm font-mono">
                  {Number(trustlineStatus.balance).toFixed(2)} USDC
                </span>
              ) : (
                <div className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="inline w-4 h-4 text-yellow-500" />
                  USDC trustline required
                </div>
              )}
            </div>

            {!trustlineStatus.checking && !trustlineStatus.exists && (
              <div className="space-y-2">
                {xlmBalance.checking ? (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking XLM balance...
                  </div>
                ) : parseFloat(xlmBalance.balance) >= 1.5 ? (
                  <Button
                    size="sm"
                    onClick={handleCreateTrustline}
                    className="w-full h-7 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add USDC Trustline
                  </Button>
                ) : (
                  <div className="text-xs text-red-600">
                    Need at least 1.5 XLM for trustline creation
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Disconnect */}
        <DropdownMenuItem onClick={handleDisconnect} variant="destructive">
          <LogOut className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
