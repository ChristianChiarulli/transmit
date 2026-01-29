import { nip19 } from 'nostr-tools'
import type { Event } from 'nostr-tools/core'

import { getFirst, getTagValue, getTagValues, parseImetaTag, toNumber } from './tags'

export interface AudioVariant {
  url: string
  type?: string
  hash?: string
  size?: number | null
  duration?: number | null
  bitrate?: number | null
  image?: string
  fallback?: string[]
}

export interface PodcastShow {
  address: string
  addressTag: string
  pubkey: string
  d: string
  title: string
  frequency?: string
  image?: string
  links: string[]
  tags: string[]
  hosts: string[]
  externalIds: string[]
  content?: string
  createdAt: number
}

export interface PodcastEpisode {
  address: string
  addressTag: string
  pubkey: string
  d: string
  title: string
  showTitle?: string
  summary?: string
  content?: string
  publishedAt: number
  showAddress: string
  externalIds: string[]
  tags: string[]
  audioVariants: AudioVariant[]
  audio: { src: string; type?: string } | null
  createdAt: number
}

const SHOW_KIND = 30074
const EPISODE_KIND = 30075

function getAddress(kind: number, pubkey: string, d: string) {
  return nip19.naddrEncode({ kind, pubkey, identifier: d })
}

function uniqueByAddress(events: Event[]) {
  let latestByAddress = new Map<string, Event>()

  for (let event of events) {
    let d = getTagValue(event.tags, 'd')
    if (!d) continue
    let address = `${event.kind}:${event.pubkey}:${d}`
    let existing = latestByAddress.get(address)
    if (!existing || event.created_at > existing.created_at) {
      latestByAddress.set(address, event)
    }
  }

  return Array.from(latestByAddress.values())
}

function parseAudioVariants(tags: string[][]) {
  let imetaTags = tags.filter((tag) => tag[0] === 'imeta')
  let variants: AudioVariant[] = []

  for (let tag of imetaTags) {
    let imeta = parseImetaTag(tag)
    let url = getFirst(imeta, 'url')
    if (!url) continue
    let type = getFirst(imeta, 'm')

    if (type && !type.startsWith('audio/')) continue

    variants.push({
      url,
      type,
      hash: getFirst(imeta, 'x'),
      size: toNumber(getFirst(imeta, 'size')),
      duration: toNumber(getFirst(imeta, 'duration')),
      bitrate: toNumber(getFirst(imeta, 'bitrate')),
      image: getFirst(imeta, 'image'),
      fallback: imeta.fallback,
    })
  }

  return variants
}

function selectPrimaryAudio(variants: AudioVariant[]) {
  if (!variants.length) return null
  return variants[0]
}

export function parseShow(event: Event): PodcastShow | null {
  let d = getTagValue(event.tags, 'd')
  let title = getTagValue(event.tags, 'title')

  if (!d || !title) return null

  return {
    address: getAddress(SHOW_KIND, event.pubkey, d),
    addressTag: `${SHOW_KIND}:${event.pubkey}:${d}`,
    pubkey: event.pubkey,
    d,
    title,
    frequency: getTagValue(event.tags, 'frequency') ?? undefined,
    image: getTagValue(event.tags, 'image') ?? undefined,
    links: getTagValues(event.tags, 'r'),
    tags: getTagValues(event.tags, 't'),
    hosts: getTagValues(event.tags, 'p'),
    externalIds: getTagValues(event.tags, 'i'),
    content: event.content || undefined,
    createdAt: event.created_at,
  }
}

export function parseEpisode(event: Event): PodcastEpisode | null {
  let d = getTagValue(event.tags, 'd')
  let title = getTagValue(event.tags, 'title')
  let publishedAt = toNumber(getTagValue(event.tags, 'published_at'))
  let showAddress = getTagValue(event.tags, 'a')

  if (!d || !title || !publishedAt || !showAddress) return null

  let audioVariants = parseAudioVariants(event.tags)
  let primary = selectPrimaryAudio(audioVariants)

  return {
    address: getAddress(EPISODE_KIND, event.pubkey, d),
    addressTag: `${EPISODE_KIND}:${event.pubkey}:${d}`,
    pubkey: event.pubkey,
    d,
    title,
    summary: getTagValue(event.tags, 'summary') ?? undefined,
    content: event.content || undefined,
    publishedAt,
    showAddress,
    externalIds: getTagValues(event.tags, 'i'),
    tags: getTagValues(event.tags, 't'),
    audioVariants,
    audio: primary ? { src: primary.url, type: primary.type } : null,
    createdAt: event.created_at,
  }
}

export function filterShows(events: Event[]) {
  return uniqueByAddress(events)
    .map(parseShow)
    .filter((show): show is PodcastShow => Boolean(show))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function filterEpisodes(events: Event[]) {
  return uniqueByAddress(events)
    .map(parseEpisode)
    .filter((episode): episode is PodcastEpisode => Boolean(episode))
    .sort((a, b) => b.publishedAt - a.publishedAt)
}

export function decodeNaddr(naddr: string) {
  let decoded = nip19.decode(naddr)
  if (decoded.type !== 'naddr') return null
  return decoded.data
}

export function encodeAddressTag(address: string) {
  let [kind, pubkey, ...identifierParts] = address.split(':')
  let identifier = identifierParts.join(':')
  if (!kind || !pubkey || !identifier) return null
  let kindNumber = Number(kind)
  if (!Number.isFinite(kindNumber)) return null
  return nip19.naddrEncode({ kind: kindNumber, pubkey, identifier })
}

export const PODCAST_SHOW_KIND = SHOW_KIND
export const PODCAST_EPISODE_KIND = EPISODE_KIND
