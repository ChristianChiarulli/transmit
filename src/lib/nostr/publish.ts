'use client'

import { finalizeEvent } from 'nostr-tools'
import type { Event, EventTemplate } from 'nostr-tools/core'
import { hexToBytes } from 'nostr-tools/utils'

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
  return signEventWithKey(event)
}

export async function signEventWithKey(event: EventTemplate, secretKey?: string) {
  if (secretKey) {
    let secretKeyBytes = hexToBytes(secretKey)
    return finalizeEvent(event, secretKeyBytes)
  }

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
