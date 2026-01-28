'use client'

import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { useRelayStore } from '@/state/relayStore'

export default function Relays() {
  let readRelay = useRelayStore((state) => state.readRelay)
  let writeRelays = useRelayStore((state) => state.writeRelays)

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Relays</Heading>
      <Text className="mt-2">
        Reads use a single relay at a time. Publishing posts to all configured relays.
      </Text>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Read relay</Subheading>
          <Text>Use the sidebar dropdown to switch your active read relay.</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900">
          {readRelay ?? 'No read relay selected.'}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Publish relays</Subheading>
          <Text>Set these in NEXT_PUBLIC_NOSTR_RELAYS (comma-separated).</Text>
        </div>
        <div className="space-y-2">
          {writeRelays.length ? (
            writeRelays.map((relay) => (
              <div
                key={relay}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {relay}
              </div>
            ))
          ) : (
            <Text>No relays configured yet.</Text>
          )}
        </div>
      </section>
    </div>
  )
}
