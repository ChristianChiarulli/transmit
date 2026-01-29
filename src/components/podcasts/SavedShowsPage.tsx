'use client'

import { Divider } from '@/components/divider'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Link } from '@/components/link'
import { useShowList } from '@/hooks/useShowList'
import { useShowsByAddresses } from '@/hooks/usePodcasts'

export function SavedShowsPage() {
  let { addresses, isLoading, pubkey } = useShowList()
  let { data: shows = [], isLoading: showsLoading } = useShowsByAddresses(addresses)
  let missingCount = Math.max(addresses.length - shows.length, 0)

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Shows</Heading>
      <Divider className="my-6" />

      {!pubkey && <Text>Connect Nostr to build your list of saved shows.</Text>}
      {pubkey && isLoading && <Text>Loading your list...</Text>}
      {pubkey && !isLoading && addresses.length === 0 && <Text>No saved shows yet.</Text>}

      {showsLoading && addresses.length > 0 && <Text>Loading shows from this relay...</Text>}
      {missingCount > 0 && (
        <Text className="mt-4 text-sm text-zinc-500">
          {missingCount} saved {missingCount === 1 ? 'show' : 'shows'} unavailable on this relay.
        </Text>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shows.map((show) => (
          <div key={show.address} className="group">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
              {show.image ? (
                <img src={show.image} alt={show.title} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                  No image
                </div>
              )}
            </div>
            <div className="mt-3">
              <Link href={`/shows/${show.address}`} className="text-base/6 font-semibold text-zinc-950 dark:text-white">
                {show.title}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {show.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
