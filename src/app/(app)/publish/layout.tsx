import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publish',
  description: 'Publish a new Nostr podcast show or episode.',
}

export default function PublishLayout({ children }: { children: React.ReactNode }) {
  return children
}
