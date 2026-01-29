'use client'

import { EpisodePlayButton } from '@/components/EpisodePlayButton'
import { Subheading } from '@/components/heading'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'
import { Text } from '@/components/text'
import { useEpisodesForShow } from '@/hooks/usePodcasts'
import { type PodcastEpisode, type PodcastShow } from '@/lib/nostr/podcasts'
import dayjs from 'dayjs'

function EpisodeEntry({
  episode,
  showTitle,
  showAddress,
}: {
  episode: PodcastEpisode
  showTitle: string
  showAddress: string
}) {
  let published = dayjs.unix(episode.publishedAt).format('MMM D, YYYY')

  return (
    <article className="py-8">
      <div className="flex flex-col items-start gap-3">
        <Text className="font-mono text-xs/6 tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {published}
        </Text>
        <div className="text-lg/7 font-semibold text-zinc-950 dark:text-white">{episode.title}</div>
        <Text className="text-base/7 text-zinc-600 dark:text-zinc-300">
          {episode.summary ?? episode.content ?? 'No summary yet.'}
        </Text>
        <div className="mt-2 flex items-center gap-3 text-sm/6 font-semibold text-zinc-600 dark:text-zinc-400">
          <EpisodePlayButton
            episode={{ ...episode, showTitle, showAddress }}
            className="flex items-center gap-2 text-zinc-600 transition hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-200"
            disabled={!episode.audio?.src}
            playing={
              <>
                <PauseIcon className="h-2.5 w-2.5 fill-current" />
                <span>Listen</span>
              </>
            }
            paused={
              <>
                <PlayIcon className="h-2.5 w-2.5 fill-current" />
                <span>Listen</span>
              </>
            }
          />
        </div>
      </div>
    </article>
  )
}

export function EpisodeList({ show }: { show: PodcastShow }) {
  let { data, isLoading, error } = useEpisodesForShow(show.addressTag)

  return (
    <div className="mt-10">
      <Subheading>Episodes</Subheading>
      {isLoading && <Text className="mt-4">Loading episodes...</Text>}
      {error && <Text className="mt-4 text-red-600">Failed to load episodes.</Text>}
      {!isLoading && !error && data?.length === 0 && <Text className="mt-4">No episodes published yet.</Text>}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {data?.map((episode) => (
          <EpisodeEntry key={episode.address} episode={episode} showTitle={show.title} showAddress={show.address} />
        ))}
      </div>
    </div>
  )
}
