'use client'

import { useQuery } from '@tanstack/react-query'
import type { Filter } from 'nostr-tools/filter'

import { pool } from '@/lib/nostr/pool'
import {
  decodeNaddr,
  filterEpisodes,
  filterShows,
  PODCAST_EPISODE_KIND,
  PODCAST_SHOW_KIND,
} from '@/lib/nostr/podcasts'
import { parseAddressTag } from '@/lib/nostr/show-lists'
import { useReadRelay } from '@/hooks/useReadRelay'

async function fetchEvents(relay: string, filter: Filter) {
  return pool.querySync([relay], filter, { maxWait: 4000 })
}

export function useShows() {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['shows', relay],
    queryFn: async () => {
      if (!relay) return []
      let events = await fetchEvents(relay, {
        kinds: [PODCAST_SHOW_KIND],
        limit: 200,
      })
      return filterShows(events)
    },
    enabled: Boolean(relay),
    staleTime: 30_000,
  })
}

export function useShow(naddr: string | null) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['show', relay, naddr],
    queryFn: async () => {
      if (!relay || !naddr) return null
      let decoded = decodeNaddr(naddr)
      if (!decoded) return null
      let events = await fetchEvents(relay, {
        kinds: [decoded.kind],
        authors: [decoded.pubkey],
        '#d': [decoded.identifier],
        limit: 10,
      })
      return filterShows(events)[0] ?? null
    },
    enabled: Boolean(relay && naddr),
    staleTime: 30_000,
  })
}

export function useEpisodesForShow(showAddress: string | null) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['episodes', relay, showAddress],
    queryFn: async () => {
      if (!relay || !showAddress) return []
      let events = await fetchEvents(relay, {
        kinds: [PODCAST_EPISODE_KIND],
        '#a': [showAddress],
        limit: 200,
      })
      return filterEpisodes(events)
    },
    enabled: Boolean(relay && showAddress),
    staleTime: 30_000,
  })
}

export function useEpisode(naddr: string | null) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['episode', relay, naddr],
    queryFn: async () => {
      if (!relay || !naddr) return null
      let decoded = decodeNaddr(naddr)
      if (!decoded) return null
      let events = await fetchEvents(relay, {
        kinds: [decoded.kind],
        authors: [decoded.pubkey],
        '#d': [decoded.identifier],
        limit: 10,
      })
      return filterEpisodes(events)[0] ?? null
    },
    enabled: Boolean(relay && naddr),
    staleTime: 30_000,
  })
}

export function useEpisodeEvent(naddr: string | null) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['episode-event', relay, naddr],
    queryFn: async () => {
      if (!relay || !naddr) return null
      let decoded = decodeNaddr(naddr)
      if (!decoded) return null
      let events = await fetchEvents(relay, {
        kinds: [decoded.kind],
        authors: [decoded.pubkey],
        '#d': [decoded.identifier],
        limit: 10,
      })
      return events[0] ?? null
    },
    enabled: Boolean(relay && naddr),
    staleTime: 30_000,
  })
}

export function useShowsByAddresses(addresses: string[]) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['shows-by-address', relay, addresses],
    queryFn: async () => {
      if (!relay || addresses.length === 0) return []
      let parsed = addresses
        .map(parseAddressTag)
        .filter((address): address is NonNullable<ReturnType<typeof parseAddressTag>> => Boolean(address))
        .filter((address) => address.kind === PODCAST_SHOW_KIND)

      if (parsed.length === 0) return []

      let authors = Array.from(new Set(parsed.map((item) => item.pubkey)))
      let identifiers = Array.from(new Set(parsed.map((item) => item.identifier)))

      let events = await fetchEvents(relay, {
        kinds: [PODCAST_SHOW_KIND],
        authors,
        '#d': identifiers,
        limit: Math.min(200, parsed.length),
      })

      let shows = filterShows(events)
      let byAddress = new Map(shows.map((show) => [show.addressTag, show]))

      return addresses
        .map((address) => byAddress.get(address))
        .filter((show): show is NonNullable<typeof show> => Boolean(show))
    },
    enabled: Boolean(relay),
    staleTime: 30_000,
  })
}
