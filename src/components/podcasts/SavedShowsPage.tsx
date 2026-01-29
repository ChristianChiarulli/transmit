'use client'

import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { useShowList } from '@/hooks/useShowList'
import { useShowsByAddresses } from '@/hooks/usePodcasts'
import { ShowCard } from '@/components/podcasts/ShowCard'

export function SavedShowsPage() {
  let { addresses, isLoading, pubkey } = useShowList()
  let { data: shows = [], isLoading: showsLoading } = useShowsByAddresses(addresses)
  let missingCount = Math.max(addresses.length - shows.length, 0)

  return (
    <div className="mx-auto">
      <Heading>Shows</Heading>
      <Subheading className="mt-8">Latest</Subheading>

      {!pubkey && <Text>Connect Nostr to build your list of saved shows.</Text>}
      {pubkey && isLoading && <Text>Loading your list...</Text>}
      {pubkey && !isLoading && addresses.length === 0 && <Text>No saved shows yet.</Text>}

      {showsLoading && addresses.length > 0 && <Text>Loading shows from this relay...</Text>}
      {missingCount > 0 && (
        <Text className="mt-4 text-sm text-zinc-500">
          {missingCount} saved {missingCount === 1 ? 'show' : 'shows'} unavailable on this relay.
        </Text>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {shows.map((show) => (
          <ShowCard key={show.address} title={show.title} image={show.image} href={`/shows/${show.address}`} tags={show.tags} />
        ))}
      </div>
    </div>
  )
}
