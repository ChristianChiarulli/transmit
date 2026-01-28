'use client'

import type { Event, EventTemplate } from 'nostr-tools/core'

import { pool } from './pool'

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>
      signEvent: (event: EventTemplate) => Promise<Event>
    }
  }
}

export async function signEvent(event: EventTemplate) {
  if (!window.nostr?.signEvent) {
    throw new Error('NIP-07 signer not available')
  }

  return window.nostr.signEvent(event)
}

export async function publishEvent(event: Event, relays: string[]) {
  if (!relays.length) {
    throw new Error('No relays configured')
  }

  let publishes = pool.publish(relays, event)
  let results = await Promise.allSettled(publishes)

  return results
}
