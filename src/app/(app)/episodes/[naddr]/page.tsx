'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { Dropdown, DropdownButton, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { Avatar } from '@/components/avatar'
import { useEpisode, useEpisodeEvent } from '@/hooks/usePodcasts'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'

export default function EpisodePage() {
  let params = useParams<{ naddr: string }>()
  let naddr = params?.naddr ?? null
  let { data: episode, isLoading, error } = useEpisode(naddr)
  let { data: rawEvent } = useEpisodeEvent(naddr)
  let [showJson, setShowJson] = useState(false)

  if (isLoading) {
    return <Text>Loading episode...</Text>
  }

  if (error || !episode) {
    return <Text className="text-red-600">Unable to load this episode.</Text>
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-6">
          <Avatar src={episode.audioVariants[0]?.image ?? null} square className="size-20" alt={episode.title} />
          <div>
            <Heading>{episode.title}</Heading>
            <Text className="mt-2">{episode.summary ?? 'No summary provided.'}</Text>
            {episode.audio?.src && (
              <div className="mt-4">
                <audio className="w-full" controls src={episode.audio.src} />
              </div>
            )}
          </div>
        </div>
        <Dropdown>
          <DropdownButton as={Button} plain>
            <EllipsisHorizontalIcon />
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem onClick={() => setShowJson(true)} disabled={!rawEvent}>
              <DropdownLabel>View raw JSON</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="mt-8">
        <Subheading>Show notes</Subheading>
        <Text className="mt-2 whitespace-pre-line">
          {episode.content ?? 'No show notes have been added for this episode.'}
        </Text>
      </div>

      <Dialog open={showJson} onClose={setShowJson} size="3xl">
        <DialogTitle>Raw event JSON</DialogTitle>
        <DialogBody>
          <pre className="max-h-[60vh] overflow-auto rounded-lg bg-zinc-950 px-4 py-3 text-xs text-zinc-100">
            {rawEvent ? JSON.stringify(rawEvent, null, 2) : 'No event data available.'}
          </pre>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowJson(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
