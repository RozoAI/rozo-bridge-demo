'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  className?: string
}

export function CodeBlock({ code, language = 'typescript', title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className={`relative rounded-lg border bg-muted/50 ${className || ''}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}