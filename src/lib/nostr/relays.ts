const fallbackRelays = ['wss://relay.damus.io']

const relayList = (process.env.NEXT_PUBLIC_NOSTR_RELAYS ?? '')
  .split(',')
  .map((relay) => relay.trim())
  .filter(Boolean)

const defaultReadRelay =
  process.env.NEXT_PUBLIC_NOSTR_READ_RELAY ??
  relayList[0] ??
  fallbackRelays[0] ??
  null

export function getConfiguredRelays() {
  return relayList.length ? relayList : fallbackRelays
}

export function getDefaultReadRelay() {
  return defaultReadRelay
}
