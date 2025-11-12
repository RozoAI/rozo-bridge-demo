"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateAddress } from "@/lib/validation";

interface BaseAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorChange?: (error: string) => void;
}

export function BaseAddressInput({
  value,
  onChange,
  error,
  onErrorChange,
}: BaseAddressInputProps) {
  const handleChange = (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.trim() === "") {
      onErrorChange?.("");
      return;
    }

    const validation = validateAddress(inputValue);
    if (!validation.isValid) {
      onErrorChange?.(validation.error || "Invalid address");
    } else {
      onErrorChange?.("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="base-address" className="text-neutral-400">
        Base Address
      </Label>
      <Input
        id="base-address"
        placeholder="0x..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={`h-12 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 ${
          error ? "border-red-500 focus-visible:border-red-500" : ""
        }`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

