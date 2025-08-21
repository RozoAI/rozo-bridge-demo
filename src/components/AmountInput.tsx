'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatTokenAmount, validateAmount } from '@/lib/validation'
import { trackUIInteraction } from '@/lib/analytics'
import { getTokenLogoUrl } from '@/lib/crypto-logos'
import { cn } from '@/lib/utils'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  balance?: string
  isLoadingBalance?: boolean
  token?: {
    symbol: string
    decimals: number
    logoUrl?: string
  }
  disabled?: boolean
  error?: string
  className?: string
}

export function AmountInput({
  value,
  onChange,
  balance,
  isLoadingBalance = false,
  token = { symbol: 'USDC', decimals: 6 },
  disabled = false,
  error,
  className,
}: AmountInputProps) {
  const [focused, setFocused] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Validate amount on change
  useEffect(() => {
    if (value) {
      const validation = validateAmount(value, balance)
      setValidationError(validation.error || null)
    } else {
      setValidationError(null)
    }
  }, [value, balance])

  const handleMaxClick = () => {
    if (balance && !disabled) {
      onChange(balance)
      trackUIInteraction('max_clicked')
    }
  }

  const handleHalfClick = () => {
    if (balance && !disabled) {
      const halfAmount = (parseFloat(balance) / 2).toString()
      onChange(halfAmount)
      trackUIInteraction('half_clicked')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string
    if (inputValue === '') {
      onChange('')
      return
    }

    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return
    }

    // Prevent multiple decimal points
    if ((inputValue.match(/\./g) || []).length > 1) {
      return
    }

    // Limit decimal places based on token decimals
    const decimalIndex = inputValue.indexOf('.')
    if (decimalIndex !== -1 && inputValue.length - decimalIndex - 1 > token.decimals) {
      return
    }

    onChange(inputValue)
  }

  const displayError = error || validationError
  const hasBalance = balance && parseFloat(balance) > 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="amount-input" className="text-sm font-medium">
          Amount
        </Label>
        {hasBalance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Balance:</span>
            {isLoadingBalance ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className="font-mono">
                {formatTokenAmount(balance!, token.decimals)} {token.symbol}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <div
          className={cn(
            'relative flex items-center rounded-lg border bg-background transition-colors',
            focused && 'ring-2 ring-ring ring-offset-2',
            displayError && 'border-destructive',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Input
            id="amount-input"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className="border-0 bg-transparent text-lg font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          <div className="flex items-center gap-2 pr-3">
            <div className="relative">
              <Image
                src={token.logoUrl || getTokenLogoUrl(token.symbol)}
                alt={token.symbol}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full"
                onError={(e) => {
                  // Fallback to generated logo if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = getTokenLogoUrl(token.symbol)
                }}
              />
            </div>
            <Badge variant="secondary" className="font-medium">
              {token.symbol}
            </Badge>
          </div>
        </div>

        {hasBalance && !disabled && (
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleHalfClick}
              className="h-7 px-2 text-xs"
            >
              Half
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMaxClick}
              className="h-7 px-2 text-xs"
            >
              Max
            </Button>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}

      {value && !displayError && (
        <div className="text-sm text-muted-foreground">
          ≈ ${formatTokenAmount(value, 2)} USD
        </div>
      )}
    </div>
  )
}
