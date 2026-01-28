'use client'

import { SidebarHeading, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { Text } from '@/components/text'
import { useShowList } from '@/hooks/useShowList'
import { useShowsByAddresses } from '@/hooks/usePodcasts'

export function SidebarShowList() {
  let { addresses, isLoading, pubkey } = useShowList()
  let { data: shows = [] } = useShowsByAddresses(addresses)

  let visibleShows = shows.slice(0, 5)
  let hasMore = addresses.length > visibleShows.length

  return (
    <SidebarSection>
      <SidebarHeading>Shows</SidebarHeading>

      {!pubkey && <Text className="px-2 text-xs/6 text-zinc-500">Connect Nostr to save shows.</Text>}
      {pubkey && isLoading && <Text className="px-2 text-xs/6 text-zinc-500">Loading your list…</Text>}
      {pubkey && !isLoading && addresses.length === 0 && (
        <Text className="px-2 text-xs/6 text-zinc-500">No saved shows yet.</Text>
      )}

      {visibleShows.map((show) => (
        <SidebarItem key={show.address} href={`/shows/${show.address}`}>
          <SidebarLabel>{show.title}</SidebarLabel>
        </SidebarItem>
      ))}

      {hasMore && (
        <SidebarItem href="/shows">
          <SidebarLabel>View all</SidebarLabel>
        </SidebarItem>
      )}
    </SidebarSection>
  )
}
