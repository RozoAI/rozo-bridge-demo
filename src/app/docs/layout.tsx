import { DocsLayout } from '@/components/docs/DocsLayout'

export default function DocsLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocsLayout>{children}</DocsLayout>
}