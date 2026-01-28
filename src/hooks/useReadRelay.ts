'use client'

import { useEffect, useRef } from 'react'

import { pool } from '@/lib/nostr/pool'
import { useRelayStore } from '@/state/relayStore'

export function useReadRelay() {
  let readRelay = useRelayStore((state) => state.readRelay)
  let previousRelay = useRef<string | null>(null)

  useEffect(() => {
    if (previousRelay.current && previousRelay.current !== readRelay) {
      pool.close([previousRelay.current])
    }
    previousRelay.current = readRelay ?? null
  }, [readRelay])

  return readRelay
}
