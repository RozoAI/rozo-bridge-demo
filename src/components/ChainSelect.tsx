'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { supportedChains, comingSoonChains } from '@/lib/chains'
import { SUPPORTED_INTENT_CHAINS } from '@/lib/intentPay'
import { cn } from '@/lib/utils'

interface ChainSelectProps {
  value?: number | null
  onValueChange: (chainId: number | null) => void
  placeholder?: string
  disabled?: boolean
  excludeChainId?: number | null
  className?: string
}

export function ChainSelect({
  value,
  onValueChange,
  placeholder = 'Select chain',
  disabled = false,
  excludeChainId,
  className,
}: ChainSelectProps) {
  const [open, setOpen] = useState(false)
  const [supportedChainIds, setSupportedChainIds] = useState<number[]>([])

  // Load supported chains on mount
  React.useEffect(() => {
    setSupportedChainIds(SUPPORTED_INTENT_CHAINS)
  }, [])

  const selectedChain = [...supportedChains, ...comingSoonChains].find(chain => chain.id === value)
  
  const availableChains = [...supportedChains, ...comingSoonChains].filter(chain => {
    // Filter out excluded chain
    if (excludeChainId && chain.id === excludeChainId) return false
    return true
  })

  const isChainSupported = (chainId: number) => {
    // Check if the chain is in the supported chains list (not coming soon)
    return supportedChains.some(chain => chain.id === chainId)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-12 px-3',
            !selectedChain && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {selectedChain ? (
            <div className="flex items-center gap-3">
              <Image
                src={selectedChain.logo}
                alt={selectedChain.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  // Fallback to gradient circle if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 items-center justify-center text-white text-xs font-bold hidden">
                {selectedChain.name.charAt(0)}
              </div>
              <span className="font-medium">{selectedChain.name}</span>
              {!isChainSupported(selectedChain.id) && (
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search chains..." />
          <CommandList>
            <CommandEmpty>No chains found.</CommandEmpty>
            <CommandGroup>
              {availableChains.map((chain) => {
                const supported = isChainSupported(chain.id)
                return (
                  <CommandItem
                    key={chain.id}
                    value={chain.name}
                    onSelect={() => {
                      if (supported) {
                        onValueChange(chain.id === value ? null : chain.id)
                        setOpen(false)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3',
                      !supported && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={!supported}
                  >
                    <div className="relative">
                      <Image
                        src={chain.logo}
                        alt={chain.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          // Fallback to gradient circle if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 items-center justify-center text-white text-sm font-bold hidden absolute top-0 left-0">
                        {chain.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{chain.name}</span>
                        {!supported && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chain ID: {chain.id}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === chain.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


