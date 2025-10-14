"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import {
  isMuxedAddress,
  isValidStellarAddress,
  normalizeStellarAddress,
} from "@/lib/stellar";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface StellarAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export function StellarAddressInput({
  value,
  onChange,
  label = "Stellar Address",
  placeholder = "Enter Stellar address (G... or M...)",
  className,
  required = false,
  showValidation = true,
  disabled = false,
}: StellarAddressInputProps) {
  const { stellarConnected } = useStellarWallet();
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    isMuxed: boolean;
    normalizedAddress: string | null;
    error: string | null;
  }>({
    isValid: false,
    isMuxed: false,
    normalizedAddress: null,
    error: null,
  });

  // Validate address whenever value changes
  useEffect(() => {
    if (!value.trim()) {
      setValidationState({
        isValid: false,
        isMuxed: false,
        normalizedAddress: null,
        error: null,
      });
      return;
    }

    const trimmedValue = value.trim();

    try {
      const isValid = isValidStellarAddress(trimmedValue);
      const isMuxed = isMuxedAddress(trimmedValue);
      const normalizedAddress = isValid
        ? normalizeStellarAddress(trimmedValue)
        : null;

      if (!isValid) {
        setValidationState({
          isValid: false,
          isMuxed: false,
          normalizedAddress: null,
          error: "Invalid Stellar address format",
        });
        return;
      }

      setValidationState({
        isValid: true,
        isMuxed,
        normalizedAddress,
        error: null,
      });
    } catch {
      setValidationState({
        isValid: false,
        isMuxed: false,
        normalizedAddress: null,
        error: "Invalid address format",
      });
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
    } catch (error) {
      console.warn("Failed to paste from clipboard:", error);
    }
  };

  const copyNormalizedAddress = async () => {
    if (validationState.normalizedAddress) {
      try {
        await navigator.clipboard.writeText(validationState.normalizedAddress);
      } catch (error) {
        console.warn("Failed to copy normalized address:", error);
      }
    }
  };

  const getInputClassName = () => {
    if (!showValidation || !value.trim()) {
      return "";
    }

    if (validationState.error) {
      return "border-red-300 focus:border-red-500";
    }

    if (validationState.isValid) {
      return "border-green-300 focus:border-green-500";
    }

    return "";
  };

  const showError = showValidation && validationState.error && value.trim();
  const showValid = showValidation && validationState.isValid && value.trim();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor="stellar-address" className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="flex items-center gap-2">
          {stellarConnected && (
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Wallet className="h-3 w-3" />
              <span className="text-xs">Connected</span>
            </div>
          )}

          {showValid && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs">Valid</span>
            </div>
          )}

          {showError && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Invalid</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          id="stellar-address"
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {}}
          onBlur={() => {}}
          placeholder={placeholder}
          className={cn("pr-20", getInputClassName())}
          disabled={disabled}
        />

        {/* Paste Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePaste}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Paste
        </Button>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="text-xs text-red-600 dark:text-red-400">
          {validationState.error}
        </div>
      )}
    </div>
  );
}
