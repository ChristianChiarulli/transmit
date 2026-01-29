'use client'

import { Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import { Link } from '@/components/link'
import { useEpisodesForShow } from '@/hooks/usePodcasts'
import { type PodcastEpisode, type PodcastShow } from '@/lib/nostr/podcasts'
import dayjs from 'dayjs'
import { EpisodePlayButton } from '@/components/EpisodePlayButton'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'

function EpisodeEntry({ episode, showTitle }: { episode: PodcastEpisode; showTitle: string }) {
  let published = dayjs.unix(episode.publishedAt).format('MMM D, YYYY')

  return (
    <article className="py-8">
      <div className="flex flex-col items-start gap-3">
        <Text className="text-xs/6 font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {published}
        </Text>
        <Link
          href={`/episodes/${episode.address}`}
          className="text-lg/7 font-semibold text-zinc-950 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
        >
          {episode.title}
        </Link>
        <Text className="text-base/7 text-zinc-600 dark:text-zinc-300">
          {episode.summary ?? episode.content ?? 'No summary yet.'}
        </Text>
        <div className="mt-2 flex items-center gap-3 text-sm/6 font-semibold text-zinc-600 dark:text-zinc-400">
          <EpisodePlayButton
            episode={{ ...episode, showTitle }}
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
          <span aria-hidden="true" className="text-zinc-400">
            /
          </span>
          <Link
            href={`/episodes/${episode.address}`}
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Show notes
          </Link>
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
      {!isLoading && !error && data?.length === 0 && (
        <Text className="mt-4">No episodes published yet.</Text>
      )}
      <div className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {data?.map((episode) => (
          <EpisodeEntry key={episode.address} episode={episode} showTitle={show.title} />
        ))}
      </div>
    </div>
  )
}
