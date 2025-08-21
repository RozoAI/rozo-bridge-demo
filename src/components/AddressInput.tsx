'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { validateAddress, formatPastedAddress } from '@/lib/validation'
import { trackUIInteraction } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { type Address } from 'viem'

interface SavedRecipient {
  address: Address
  label: string
}

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  savedRecipients?: SavedRecipient[]
  onSaveRecipient?: (recipient: SavedRecipient) => void
  onRemoveRecipient?: (address: Address) => void
  className?: string
}

export function AddressInput({
  value,
  onChange,
  label = 'Recipient Address',
  placeholder = '0x... or ENS name',
  disabled = false,
  error,
  savedRecipients = [],
  onSaveRecipient,
  onRemoveRecipient,
  className,
}: AddressInputProps) {
  const [focused, setFocused] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [showSaveOption, setShowSaveOption] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')

  // Validate address on change
  useEffect(() => {
    if (value) {
      const validation = validateAddress(value)
      setValidationError(validation.error || null)
      setIsValidAddress(validation.isValid)
      
      // Show save option for valid addresses that aren't already saved
      const alreadySaved = savedRecipients.some(r => 
        r.address.toLowerCase() === validation.checksumAddress?.toLowerCase()
      )
      setShowSaveOption(validation.isValid && !alreadySaved && !!onSaveRecipient)
    } else {
      setValidationError(null)
      setIsValidAddress(false)
      setShowSaveOption(false)
    }
  }, [value, savedRecipients, onSaveRecipient])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const formattedAddress = formatPastedAddress(pastedText)
    onChange(formattedAddress)
    trackUIInteraction('address_pasted')
  }

  const handleSaveRecipient = () => {
    if (isValidAddress && onSaveRecipient && saveLabel.trim()) {
      const validation = validateAddress(value)
      if (validation.checksumAddress) {
        onSaveRecipient({
          address: validation.checksumAddress,
          label: saveLabel.trim(),
        })
        setShowSaveOption(false)
        setSaveLabel('')
        trackUIInteraction('recipient_saved')
      }
    }
  }

  const handleSelectSavedRecipient = (recipient: SavedRecipient) => {
    onChange(recipient.address)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error)
    }
  }

  const displayError = error || validationError
  const hasSavedRecipients = savedRecipients.length > 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="address-input" className="text-sm font-medium">
          {label}
        </Label>
        {hasSavedRecipients && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <User className="h-3 w-3 mr-1" />
                Saved ({savedRecipients.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {savedRecipients.map((recipient) => (
                <DropdownMenuItem
                  key={recipient.address}
                  className="flex items-center justify-between p-3"
                  onSelect={() => handleSelectSavedRecipient(recipient)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{recipient.label}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {recipient.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(recipient.address)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {onRemoveRecipient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveRecipient(recipient.address)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="relative">
        <div
          className={cn(
            'relative flex items-center rounded-lg border bg-background transition-colors',
            focused && 'ring-2 ring-ring ring-offset-2',
            displayError && 'border-destructive',
            isValidAddress && 'border-green-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Input
            id="address-input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className="border-0 bg-transparent font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
          />
          
          {isValidAddress && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>

        {showSaveOption && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg">
            <Input
              type="text"
              placeholder="Label this address..."
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              className="flex-1 h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveRecipient()
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleSaveRecipient}
              disabled={!saveLabel.trim()}
              className="h-8"
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}

      {isValidAddress && !displayError && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Valid Address
          </Badge>
        </div>
      )}
    </div>
  )
}
