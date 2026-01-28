'use client'

import { useParams } from 'next/navigation'

import { Divider } from '@/components/divider'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { EpisodeList } from '@/components/podcasts/EpisodeList'
import { useShow } from '@/hooks/usePodcasts'
import { useShowList } from '@/hooks/useShowList'
import { Button } from '@/components/button'

export default function ShowPage() {
  let params = useParams<{ naddr: string }>()
  let naddr = params?.naddr ?? null
  let { data: show, isLoading, error } = useShow(naddr)
  let { isSaved, saveShow, removeShow, isSaving, pubkey } = useShowList()

  if (isLoading) {
    return <Text>Loading show...</Text>
  }

  if (error || !show) {
    return <Text className="text-red-600">Unable to load this show.</Text>
  }

  let saved = isSaved(show.addressTag)
  let canSave = Boolean(pubkey)

  function handleToggleSave() {
    if (!canSave) return
    if (saved) {
      removeShow(show.addressTag)
    } else {
      saveShow(show.addressTag)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative w-40 shrink-0">
            <div className="overflow-hidden rounded-2xl shadow-lg shadow-zinc-200/60 ring-1 ring-black/5 dark:shadow-black/30 dark:ring-white/10">
              {show.image ? (
                <img src={show.image} alt={show.title} className="size-40 object-cover" />
              ) : (
                <div className="flex size-40 items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                  No image
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 max-w-2xl">
            <Heading className="text-2xl/8 sm:text-3xl/9">{show.title}</Heading>
            <Text className="mt-3 text-base/7 text-zinc-600 dark:text-zinc-300">
              {show.content ?? 'No show description yet.'}
            </Text>
            {show.frequency && (
              <Text className="mt-3 text-sm/6 text-zinc-500 dark:text-zinc-400">
                Frequency: {show.frequency}
              </Text>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <Button
            outline={!saved || !canSave}
            color={saved && canSave ? 'dark' : undefined}
            disabled={!canSave || isSaving}
            onClick={handleToggleSave}
          >
            {!canSave ? 'Connect Nostr to save' : saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
      <Divider className="my-8" />
      <EpisodeList show={show} />
    </div>
  )
}
