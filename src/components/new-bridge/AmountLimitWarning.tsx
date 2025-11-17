"use client";

import { AlertTriangle } from "lucide-react";

interface AmountLimitWarningProps {
  limit: number;
}

export function AmountLimitWarning({ limit }: AmountLimitWarningProps) {
  return (
    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">
            Bridge Amount Limit
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-200/80">
            The bridge amount is upper bounded ${limit} for alpha. Join our
            Discord (
            <a
              href="https://discord.com/invite/EfWejgTbuU"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              here
            </a>
            ) for updates to unlock the limits.
          </p>
        </div>
      </div>
    </div>
  );
}
