"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export function StellarBalanceCard() {
  const { stellarConnected, trustlineStatus, checkTrustline } =
    useStellarWallet();

  if (!stellarConnected) return null;

  return (
    <div className="mb-4 flex items-center justify-between bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Your Balance</div>
          <div className="text-2xl font-semibold text-white">
            <span
              className={cn(
                "inline-flex items-end gap-1",
                trustlineStatus.checking ? "animate-pulse" : ""
              )}
            >
              {parseFloat(trustlineStatus.balance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm text-neutral-400">USDC</span>
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={checkTrustline}
        disabled={trustlineStatus.checking}
        className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw
          className={`w-5 h-5 text-white ${
            trustlineStatus.checking ? "animate-spin" : ""
          }`}
        />
      </button>
    </div>
  );
}
