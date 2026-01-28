'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getConfiguredRelays, getDefaultReadRelay } from '@/lib/nostr/relays'

interface RelayState {
  readRelay: string | null
  writeRelays: string[]
  setReadRelay: (relay: string) => void
  addRelay: (relay: string) => void
}

const defaultRelays = getConfiguredRelays()
const defaultReadRelay = getDefaultReadRelay()

export const useRelayStore = create<RelayState>()(
  persist(
    (set) => ({
      readRelay: defaultReadRelay,
      writeRelays: defaultRelays,
      setReadRelay: (relay) => set({ readRelay: relay }),
      addRelay: (relay) =>
        set((state) => {
          let normalized = relay.trim()
          if (!normalized) return state
          if (!/^wss?:\/\//i.test(normalized)) {
            normalized = `wss://${normalized}`
          }
          normalized = normalized.replace(/\/+$/, '')
          if (state.writeRelays.includes(normalized)) return state
          return {
            readRelay: state.readRelay ?? normalized,
            writeRelays: [...state.writeRelays, normalized],
          }
        }),
    }),
    {
      name: 'nostr-relays',
      partialize: (state) => ({ readRelay: state.readRelay, writeRelays: state.writeRelays }),
    },
  ),
)
