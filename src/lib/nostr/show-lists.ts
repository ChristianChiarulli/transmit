import type { Event } from 'nostr-tools/core'

import { getTagValue, getTagValues } from './tags'

export const SHOW_LIST_KIND = 30001
export const SHOW_LIST_D = 'podcast-shows'

export function parseShowList(event: Event | null) {
  if (!event) return []
  if (getTagValue(event.tags, 'd') !== SHOW_LIST_D) return []
  return getTagValues(event.tags, 'a')
}

export function buildShowListTags(addresses: string[]) {
  let tags: string[][] = [
    ['d', SHOW_LIST_D],
    ['title', 'My Shows'],
  ]

  for (let address of addresses) {
    tags.push(['a', address])
  }

  return tags
}

export function parseAddressTag(address: string) {
  let [kind, pubkey, ...identifierParts] = address.split(':')
  let identifier = identifierParts.join(':')

  if (!kind || !pubkey || !identifier) return null

  let kindNumber = Number(kind)
  if (!Number.isFinite(kindNumber)) return null

  return { kind: kindNumber, pubkey, identifier }
}
