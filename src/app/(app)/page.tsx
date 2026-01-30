import { ShowList } from '@/components/podcasts/ShowList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover and publish Nostr podcasts. Browse the latest shows and start listening.',
}

export default function Home() {
  return <ShowList />
}
