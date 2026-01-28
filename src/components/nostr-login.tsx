'use client'

import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { KeyIcon, UserIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'nostr-pubkey'
const EVENT_NAME = 'nostr-pubkey-changed'

function formatPubkey(pubkey: string) {
  return `${pubkey.slice(0, 10)}…${pubkey.slice(-6)}`
}

export function NostrLogin() {
  let [pubkey, setPubkey] = useState<string | null>(null)
  let [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setPubkey(stored)
  }, [])

  async function handleLogin() {
    if (typeof window === 'undefined') return
    if (!window.nostr || typeof window.nostr.getPublicKey !== 'function') {
      alert('NIP-07 extension not found. Please install a Nostr signer.')
      return
    }

    try {
      setIsLoading(true)
      let nextPubkey = await window.nostr.getPublicKey()
      setPubkey(nextPubkey)
      window.localStorage.setItem(STORAGE_KEY, nextPubkey)
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch (error) {
      console.error('NIP-07 login failed', error)
      alert('NIP-07 login failed. Check your signer permissions.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarItem onClick={handleLogin} disabled={isLoading}>
      {pubkey ? <UserIcon /> : <KeyIcon />}
      <SidebarLabel>{pubkey ? formatPubkey(pubkey) : 'Connect Nostr'}</SidebarLabel>
    </SidebarItem>
  )
}
