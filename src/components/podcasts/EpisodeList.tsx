'use client'

import { EpisodePlayButton } from '@/components/EpisodePlayButton'
import { Subheading } from '@/components/heading'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'
import { Text } from '@/components/text'
import { useEpisodesForShow } from '@/hooks/usePodcasts'
import { type PodcastEpisode, type PodcastShow } from '@/lib/nostr/podcasts'
import dayjs from 'dayjs'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'

function formatDuration(seconds?: number | null) {
  if (!seconds || Number.isNaN(seconds)) return null
  let minutes = Math.max(1, Math.round(seconds / 60))
  return `${minutes} min`
}

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
  let duration = formatDuration(episode.audioVariants[0]?.duration ?? null)

  return (
    <article className="border-b border-zinc-200/80 pb-5 transition-colors last:border-b-0 dark:border-zinc-800/80">
      <div className="flex items-start gap-4 pt-5 first:pt-0">
        <EpisodePlayButton
          episode={{ ...episode, showTitle, showAddress }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition hover:cursor-pointer hover:bg-zinc-200 disabled:opacity-40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          disabled={!episode.audio?.src}
          playing={<PauseIcon className="h-4 w-4 fill-current" />}
          paused={<PlayIcon className="h-4 w-4 translate-x-0.5 fill-current" />}
        />
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-tight text-zinc-900 dark:text-white">{episode.title}</div>
          <div className="mt-1 text-xs text-zinc-400">
            {published}
            {duration ? ` · ${duration}` : ''}
          </div>
          <Text className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-300">
            {episode.summary ?? episode.content ?? 'No summary yet.'}
          </Text>
        </div>
        <button
          type="button"
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          aria-label="More options"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}

export function EpisodeList({ show }: { show: PodcastShow }) {
  let { data, isLoading, error } = useEpisodesForShow(show.addressTag)

  return (
    <div className="mt-10">
      <Subheading className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Episodes
      </Subheading>
      {isLoading && <Text className="mt-4">Loading episodes...</Text>}
      {error && <Text className="mt-4 text-red-600">Failed to load episodes.</Text>}
      {!isLoading && !error && data?.length === 0 && <Text className="mt-4">No episodes published yet.</Text>}
      <div className="mt-5 flex flex-col gap-3">
        {data?.map((episode) => (
          <EpisodeEntry key={episode.address} episode={episode} showTitle={show.title} showAddress={show.address} />
        ))}
      </div>
    </div>
  )
}
