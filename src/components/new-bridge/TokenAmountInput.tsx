"use client";

import { formatNumber } from "@/lib/formatNumber";

interface TokenAmountInputProps {
  label: string;
  amount: string | undefined;
  setAmount: (v: string | undefined) => void;
}

export function TokenAmountInput({
  label,
  amount,
  setAmount,
}: TokenAmountInputProps) {
  // Remove all non-numeric characters except decimal point
  const cleanValue = (value: string): string => {
    return value.replace(/[^\d.]/g, "");
  };

  const handleAmountChange = (value: string) => {
    const rawValue = cleanValue(value);
    // Allow only numbers and decimal point
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      if (rawValue === "") {
        setAmount(undefined);
      } else {
        // Store as string to preserve typing state (like "0." while typing "0.5")
        setAmount(rawValue);
      }
    }
  };

  // Calculate USD value (USDC is 1:1 with USD)
  const getUsdValue = () => {
    if (!amount || amount === "") return "$0.00";
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return "$0.00";
    return `$${numValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="flex-1">
      <label className="text-sm text-neutral-400 mb-2 block">{label}</label>
      <input
        type="text"
        value={amount !== undefined ? formatNumber(amount) : ""}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="0"
        className="text-5xl font-light text-white w-full outline-none bg-transparent placeholder:text-neutral-600"
      />
      <div className="text-sm text-neutral-500 mt-2">{getUsdValue()}</div>
    </div>
  );
}
