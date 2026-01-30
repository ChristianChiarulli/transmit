import { SavedShowsPage } from '@/components/podcasts/SavedShowsPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shows',
  description: 'Manage and follow your saved Nostr podcasts.',
}

export default function ShowsPage() {
  return <SavedShowsPage />
}
