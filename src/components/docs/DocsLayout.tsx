'use client'

import { DocsSidebar } from './DocsSidebar'
import { DocsHeader } from './DocsHeader'

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 max-w-none">
          <div className="container mx-auto px-8 py-8">
            <div className="max-w-4xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}