import { Studio } from '@/components/podcasts/Studio'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'Edit and manage your Nostr podcast shows and episodes.',
}

export default function StudioPage() {
  return <Studio />
}
