'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'nostr-pubkey'
const EVENT_NAME = 'nostr-pubkey-changed'

export function useNostrPubkey() {
  let [pubkey, setPubkey] = useState<string | null>(null)

  useEffect(() => {
    let stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setPubkey(stored)

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setPubkey(event.newValue)
      }
    }

    function handleLocalChange() {
      setPubkey(window.localStorage.getItem(STORAGE_KEY))
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(EVENT_NAME, handleLocalChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(EVENT_NAME, handleLocalChange)
    }
  }, [])

  return pubkey
}
