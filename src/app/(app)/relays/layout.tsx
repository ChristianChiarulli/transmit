import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Relays',
  description: 'Configure read and publish relays for your Nostr podcast content.',
}

export default function RelaysLayout({ children }: { children: React.ReactNode }) {
  return children
}
