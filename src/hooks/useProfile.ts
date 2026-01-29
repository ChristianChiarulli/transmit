'use client'

import { useQuery } from '@tanstack/react-query'
import type { Event } from 'nostr-tools/core'

import { pool } from '@/lib/nostr/pool'
import { useReadRelay } from '@/hooks/useReadRelay'

function parseProfile(event: Event | null) {
  if (!event) return null
  try {
    let content = JSON.parse(event.content)
    if (!content || typeof content !== 'object') return null
    return {
      name: typeof content.name === 'string' ? content.name : null,
      displayName: typeof content.display_name === 'string' ? content.display_name : null,
      picture: typeof content.picture === 'string' ? content.picture : null,
      about: typeof content.about === 'string' ? content.about : null,
    }
  } catch {
    return null
  }
}

export function useProfile(pubkey: string | null) {
  let relay = useReadRelay()

  return useQuery({
    queryKey: ['profile', relay, pubkey],
    queryFn: async () => {
      if (!relay || !pubkey) return null
      let events = await pool.querySync(
        [relay],
        {
          kinds: [0],
          authors: [pubkey],
          limit: 10,
        },
        { maxWait: 4000 },
      )
      let latest = events.sort((a, b) => b.created_at - a.created_at)[0] ?? null
      return parseProfile(latest)
    },
    enabled: Boolean(relay && pubkey),
    staleTime: 60_000,
  })
}
