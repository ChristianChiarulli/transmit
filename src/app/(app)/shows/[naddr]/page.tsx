'use client'

import { useParams } from 'next/navigation'

import { Divider } from '@/components/divider'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { EpisodeList } from '@/components/podcasts/EpisodeList'
import { useEpisodesForShow, useShow } from '@/hooks/usePodcasts'
import { useShowList } from '@/hooks/useShowList'
import { Button } from '@/components/button'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function ShowPage() {
  let params = useParams<{ naddr: string }>()
  let naddr = params?.naddr ?? null
  let { data: show, isLoading, error } = useShow(naddr)
  let { data: episodes = [] } = useEpisodesForShow(show?.addressTag ?? null)
  let { isSaved, saveShow, removeShow, isSaving, pubkey } = useShowList()

  if (isLoading) {
    return <Text>Loading show...</Text>
  }

  if (error || !show) {
    return <Text className="text-red-600">Unable to load this show.</Text>
  }

  let jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: show.title,
    description: show.content ?? undefined,
    url: `${siteUrl}/shows/${show.address}`,
    image: show.image ? [show.image] : undefined,
    episode: episodes.map((episode) => ({
      '@type': 'PodcastEpisode',
      name: episode.title,
      description: episode.summary ?? episode.content ?? undefined,
      datePublished: new Date(episode.publishedAt * 1000).toISOString(),
      associatedMedia: episode.audio?.src
        ? { '@type': 'MediaObject', contentUrl: episode.audio.src }
        : undefined,
    })),
  }

  let saved = isSaved(show.addressTag)
  let canSave = Boolean(pubkey)

  function handleToggleSave() {
    if (!canSave || !show) return
    if (saved) {
      removeShow(show.addressTag)
    } else {
      saveShow(show.addressTag)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="relative h-44 w-44 shrink-0">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-xl">
            {show.image ? (
              <img src={show.image} alt={show.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-200">
                No image
              </div>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <Heading className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {show.title}
          </Heading>
          <Text className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {show.content ?? 'No show description yet.'}
          </Text>
          <div className="mt-4">
            <Button
              color="blue"
              disabled={!canSave || isSaving}
              onClick={handleToggleSave}
              className="rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {!canSave ? 'Connect Nostr to save' : saved ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </div>
      </header>
      <EpisodeList show={show} />
    </div>
  )
}
