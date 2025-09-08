'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, Copy, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isValidStellarAddress, isMuxedAddress, normalizeStellarAddress } from '@/lib/stellar'
import { useStellarWallet } from '@/contexts/StellarWalletContext'

interface StellarAddressInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  required?: boolean
  showValidation?: boolean
}

export function StellarAddressInput({
  value,
  onChange,
  label = 'Stellar Address',
  placeholder = 'Enter Stellar address (G... or M...)',
  className,
  required = false,
  showValidation = true,
}: StellarAddressInputProps) {
  const { stellarConnected, stellarAddress, connectStellarWallet } = useStellarWallet()
  const [isFocused, setIsFocused] = useState(false)
  const [validationState, setValidationState] = useState<{
    isValid: boolean
    isMuxed: boolean
    normalizedAddress: string | null
    error: string | null
  }>({
    isValid: false,
    isMuxed: false,
    normalizedAddress: null,
    error: null,
  })

  // Validate address whenever value changes
  useEffect(() => {
    if (!value.trim()) {
      setValidationState({
        isValid: false,
        isMuxed: false,
        normalizedAddress: null,
        error: null,
      })
      return
    }

    const trimmedValue = value.trim()
    
    try {
      const isValid = isValidStellarAddress(trimmedValue)
      const isMuxed = isMuxedAddress(trimmedValue)
      const normalizedAddress = isValid ? normalizeStellarAddress(trimmedValue) : null

      if (!isValid) {
        setValidationState({
          isValid: false,
          isMuxed: false,
          normalizedAddress: null,
          error: 'Invalid Stellar address format',
        })
        return
      }

      setValidationState({
        isValid: true,
        isMuxed,
        normalizedAddress,
        error: null,
      })
    } catch {
      setValidationState({
        isValid: false,
        isMuxed: false,
        normalizedAddress: null,
        error: 'Invalid address format',
      })
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text.trim())
    } catch (error) {
      console.warn('Failed to paste from clipboard:', error)
    }
  }

  const copyNormalizedAddress = async () => {
    if (validationState.normalizedAddress) {
      try {
        await navigator.clipboard.writeText(validationState.normalizedAddress)
      } catch (error) {
        console.warn('Failed to copy normalized address:', error)
      }
    }
  }

  const getInputClassName = () => {
    if (!showValidation || !value.trim()) {
      return ''
    }

    if (validationState.error) {
      return 'border-red-300 focus:border-red-500'
    }

    if (validationState.isValid) {
      return 'border-green-300 focus:border-green-500'
    }

    return ''
  }

  const showError = showValidation && validationState.error && value.trim()
  const showValid = showValidation && validationState.isValid && value.trim()
  const showMuxedInfo = validationState.isMuxed && validationState.isValid

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stellar-address" className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn('pr-20', getInputClassName())}
        />
        
        {/* Paste Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePaste}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Paste
        </Button>
      </div>

      {/* Address Type Badge */}
      {validationState.isValid && (
        <div className="flex items-center gap-2">
          <Badge variant={validationState.isMuxed ? 'secondary' : 'outline'} className="text-xs">
            {validationState.isMuxed ? 'Muxed Address (M...)' : 'Standard Address (G...)'}
          </Badge>
          
          {validationState.isMuxed && validationState.normalizedAddress !== value.trim() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyNormalizedAddress}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Base
            </Button>
          )}
        </div>
      )}

      {/* Muxed Address Info */}
      {showMuxedInfo && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium text-sm">Muxed Address Detected</span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
            <p>This is a muxed address that includes routing information.</p>
            {validationState.normalizedAddress && validationState.normalizedAddress !== value.trim() && (
              <div className="mt-2">
                <p className="text-xs font-medium">Base Account:</p>
                <p className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                  {validationState.normalizedAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="text-xs text-red-600 dark:text-red-400">
          {validationState.error}
        </div>
      )}

      {/* Address Format Help */}
      {isFocused && !value.trim() && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported address formats:</p>
          <ul className="ml-4 space-y-1">
            <li>• Standard addresses starting with &apos;G&apos; (56 characters)</li>
            <li>• Muxed addresses starting with &apos;M&apos; (69 characters)</li>
          </ul>
        </div>
      )}

      {/* Character Counter */}
      {value.trim() && (
        <div className="text-xs text-muted-foreground text-right">
          {value.trim().length} characters
          {validationState.isMuxed && ' (muxed)'}
          {!validationState.isMuxed && validationState.isValid && ' (standard)'}
        </div>
      )}
    </div>
  )
}
