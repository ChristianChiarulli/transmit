import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Show',
  description: 'Explore a Nostr podcast show and its episodes.',
}

export default function ShowsLayout({ children }: { children: React.ReactNode }) {
  return children
}
