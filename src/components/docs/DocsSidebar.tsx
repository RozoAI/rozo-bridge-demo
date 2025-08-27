'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Book, Code, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: DocItem[]
}

interface DocItem {
  title: string
  href: string
  description?: string
}

const docSections: DocSection[] = [
  {
    title: 'Getting Started',
    icon: Book,
    items: [
      { title: 'Overview', href: '/docs', description: 'Welcome to Rozo Bridge' },
      { title: 'Quick Start', href: '/docs/quick-start', description: 'Bridge in 5 seconds' },
    ]
  },
  {
    title: 'API Reference',
    icon: Globe,
    items: [
      { title: 'REST API', href: '/docs/api', description: 'Complete API documentation' },
    ]
  },
  {
    title: 'SDK Guide',
    icon: Code,
    items: [
      { title: 'TypeScript SDK', href: '/docs/sdk', description: 'Intent Pay SDK guide' },
    ]
  },
  {
    title: 'Examples',
    icon: Zap,
    items: [
      { title: 'Code Examples', href: '/docs/examples', description: 'Working implementations' },
    ]
  }
]

export function DocsSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Getting Started', 'API Reference', 'SDK Guide', 'Examples'])

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    )
  }

  return (
    <div className="w-64 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/rozo-logo.png"
            alt="Rozo Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <h2 className="font-semibold text-foreground">Rozo Bridge</h2>
            <p className="text-xs text-muted-foreground">Documentation</p>
          </div>
        </div>

        <nav className="space-y-2">
          {docSections.map((section) => {
            const isExpanded = expandedSections.includes(section.title)
            const Icon = section.icon

            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {section.title}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block p-2 text-sm rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-xs opacity-75 mt-1">{item.description}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}