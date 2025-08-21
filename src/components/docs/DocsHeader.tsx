'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Bridge
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Image
              src="/rozo-logo.png"
              alt="Rozo Logo"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="font-semibold">Documentation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="https://github.com/RozoAI/api-proxy" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              API Repository
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
          <Link href="https://www.npmjs.com/package/@rozoai/intent-pay" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-2">
              SDK Package
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}