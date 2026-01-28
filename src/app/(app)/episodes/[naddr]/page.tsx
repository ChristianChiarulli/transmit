'use client'

import { useParams } from 'next/navigation'

import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { Avatar } from '@/components/avatar'
import { useEpisode } from '@/hooks/usePodcasts'

export default function EpisodePage() {
  let params = useParams<{ naddr: string }>()
  let naddr = params?.naddr ?? null
  let { data: episode, isLoading, error } = useEpisode(naddr)

  if (isLoading) {
    return <Text>Loading episode...</Text>
  }

  if (error || !episode) {
    return <Text className="text-red-600">Unable to load this episode.</Text>
  }

  return (
    <div>
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
      <div className="mt-8">
        <Subheading>Show notes</Subheading>
        <Text className="mt-2 whitespace-pre-line">
          {episode.content ?? 'No show notes have been added for this episode.'}
        </Text>
      </div>
    </div>
  )
}
