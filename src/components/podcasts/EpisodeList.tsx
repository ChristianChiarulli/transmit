'use client'

import { Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { Link } from '@/components/link'
import { useEpisodesForShow } from '@/hooks/usePodcasts'
import { type PodcastShow } from '@/lib/nostr/podcasts'

export function EpisodeList({ show }: { show: PodcastShow }) {
  let { data, isLoading, error } = useEpisodesForShow(show.addressTag)

  return (
    <div className="mt-10">
      <Subheading>Episodes</Subheading>
      {isLoading && <Text className="mt-4">Loading episodes...</Text>}
      {error && <Text className="mt-4 text-red-600">Failed to load episodes.</Text>}
      {!isLoading && !error && data?.length === 0 && (
        <Text className="mt-4">No episodes published yet.</Text>
      )}
      <div className="mt-4 space-y-4">
        {data?.map((episode) => (
          <div
            key={episode.address}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/episodes/${episode.address}`}
                  className="text-base/6 font-semibold text-zinc-950 dark:text-white"
                >
                  {episode.title}
                </Link>
                <Text className="mt-1 line-clamp-2">
                  {episode.summary ?? episode.content ?? 'No summary yet.'}
                </Text>
              </div>
              {episode.audio?.src && (
                <audio className="h-8 w-40" controls src={episode.audio.src} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
