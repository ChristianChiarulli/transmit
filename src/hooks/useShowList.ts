'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNostrPubkey } from '@/hooks/useNostrPubkey'
import { useReadRelay } from '@/hooks/useReadRelay'
import { pool } from '@/lib/nostr/pool'
import { publishEvent, signEventWithKey } from '@/lib/nostr/publish'
import { buildShowListTags, parseShowList, SHOW_LIST_D, SHOW_LIST_KIND } from '@/lib/nostr/show-lists'
import { useRelayStore } from '@/state/relayStore'
import { useSession } from 'next-auth/react'
import type { UserWithKeys } from '@/types/auth'

async function fetchListEvent(relay: string, pubkey: string) {
  let events = await pool.querySync(
    [relay],
    {
      kinds: [SHOW_LIST_KIND],
      authors: [pubkey],
      '#d': [SHOW_LIST_D],
      limit: 10,
    },
    { maxWait: 4000 },
  )

  return events.sort((a, b) => b.created_at - a.created_at)[0] ?? null
}

function buildListEvent(addresses: string[]) {
  return {
    kind: SHOW_LIST_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: buildShowListTags(addresses),
    content: '',
  }
}

export function useShowList() {
  let relay = useReadRelay()
  let pubkey = useNostrPubkey()
  let writeRelays = useRelayStore((state) => state.writeRelays)
  let queryClient = useQueryClient()
  let { data: session } = useSession()
  let user = session?.user as UserWithKeys | undefined
  let secretKey = user?.secretKey ?? undefined

  let queryKey = ['show-list', relay, pubkey]

  let query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!relay || !pubkey) return []
      let event = await fetchListEvent(relay, pubkey)
      return parseShowList(event)
    },
    enabled: Boolean(relay && pubkey),
    staleTime: 30_000,
  })

  let mutation = useMutation({
    mutationFn: async (nextAddresses: string[]) => {
      if (!pubkey) throw new Error('Connect your Nostr signer first.')
      let eventTemplate = buildListEvent(nextAddresses)
      let signed = await signEventWithKey(eventTemplate, secretKey)
      return publishEvent(signed, writeRelays)
    },
    onMutate: async (nextAddresses) => {
      await queryClient.cancelQueries({ queryKey })
      let previous = queryClient.getQueryData<string[]>(queryKey)
      queryClient.setQueryData(queryKey, nextAddresses)
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  let addresses = query.data ?? []

  function saveShow(address: string) {
    if (!address || addresses.includes(address)) return
    mutation.mutate([...addresses, address])
  }

  function removeShow(address: string) {
    if (!address || !addresses.includes(address)) return
    mutation.mutate(addresses.filter((item) => item !== address))
  }

  function isSaved(address: string) {
    return addresses.includes(address)
  }

  return {
    pubkey,
    addresses,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    saveShow,
    removeShow,
    isSaved,
    isSaving: mutation.isPending,
  }
}
