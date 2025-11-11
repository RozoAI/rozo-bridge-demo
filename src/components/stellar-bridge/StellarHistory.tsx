"use client";

import { formatAddress } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StellarHistoryItem } from "./types/history";
import {
  getStellarHistoryForWallet,
  removeDuplicateStellarPayments,
  ROZO_STELLAR_HISTORY_STORAGE_KEY,
} from "./utils/history";

interface StellarHistoryProps {
  walletAddress: string;
}

export const StellarHistory = ({ walletAddress }: StellarHistoryProps) => {
  const [history, setHistory] = useState<StellarHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<
    string | null
  >(null);

  const loadHistory = useCallback(() => {
    try {
      // First, clean up any existing duplicates
      removeDuplicateStellarPayments(walletAddress);

      const stellarHistory = getStellarHistoryForWallet(walletAddress);

      // Sort by date descending (newest first)
      const sortedHistory = stellarHistory.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      setHistory(sortedHistory);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Load history on mount and when wallet address changes
  useEffect(() => {
    // Clear history when wallet changes
    if (currentWalletAddress && currentWalletAddress !== walletAddress) {
      setHistory([]);
    }

    setCurrentWalletAddress(walletAddress);
    setIsLoading(true);
    loadHistory();
  }, [walletAddress, loadHistory, currentWalletAddress]);

  // Listen for storage changes to refetch when payment is completed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ROZO_STELLAR_HISTORY_STORAGE_KEY) {
        loadHistory();
      }
    };

    const handleCustomEvent = () => {
      loadHistory();
    };

    // Listen for storage changes (works across tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom payment completed events (works within same tab)
    window.addEventListener("stellar-payment-completed", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "stellar-payment-completed",
        handleCustomEvent
      );
    };
  }, [loadHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(ROZO_STELLAR_HISTORY_STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-muted-foreground text-sm">Loading history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <Clock className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          No transaction history yet
        </p>
        <p className="text-muted-foreground text-xs text-center">
          Your completed deposits and withdrawals will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Transaction History
        </h3>
        <button
          onClick={clearHistory}
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-xs transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>

      <div className="max-h-[300px] space-y-2 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-card border-border hover:bg-accent flex flex-col items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.type === "deposit" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-foreground text-sm font-medium">
                  {item.amount} USDC
                </span>
              </div>
              <span className="text-muted-foreground text-xs">
                {formatDate(item.completedAt)}
              </span>
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    To: {formatAddress(item.destinationAddress)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    ID: {formatAddress(item.paymentId)}
                  </span>
                </div>
              </div>
              <Link
                href={`https://invoice.rozo.ai/receipt?id=${item.paymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground mt-auto flex items-center gap-1 text-xs transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
