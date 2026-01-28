'use client'

import { useParams } from 'next/navigation'

import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Avatar } from '@/components/avatar'
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-6">
          <Avatar src={show.image ?? null} square className="size-20" alt={show.title} />
          <div>
            <Heading>{show.title}</Heading>
            <Text className="mt-2">{show.content ?? 'No show description yet.'}</Text>
          </div>
        </div>
        <Button
          outline={!saved || !canSave}
          color={saved && canSave ? 'dark' : undefined}
          disabled={!canSave || isSaving}
          onClick={handleToggleSave}
        >
          {!canSave ? 'Connect Nostr to save' : saved ? 'Saved' : 'Save'}
        </Button>
      </div>
      <EpisodeList show={show} />
    </div>
  )
}
