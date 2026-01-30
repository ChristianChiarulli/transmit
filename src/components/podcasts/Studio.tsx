'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import { Textarea } from '@/components/textarea'
import { useEpisodesForShow, useShowsByAuthor } from '@/hooks/usePodcasts'
import { useNostrPubkey } from '@/hooks/useNostrPubkey'
import { publishEvent, signEventWithKey } from '@/lib/nostr/publish'
import { PODCAST_EPISODE_KIND, PODCAST_SHOW_KIND, type PodcastEpisode, type PodcastShow } from '@/lib/nostr/podcasts'
import { useRelayStore } from '@/state/relayStore'
import type { UserWithKeys } from '@/types/auth'
import {
  ChevronLeftIcon,
  MicrophoneIcon,
  PencilSquareIcon,
  PlusIcon,
  PlayIcon,
} from '@heroicons/react/20/solid'

const gradients = [
  'from-slate-900 via-slate-800 to-blue-900',
  'from-orange-600 via-red-600 to-pink-600',
  'from-blue-600 via-indigo-600 to-violet-600',
  'from-emerald-600 via-teal-600 to-cyan-600',
  'from-purple-600 via-fuchsia-600 to-pink-600',
]

function inferAudioType(url: string) {
  let clean = url.split('?')[0]?.split('#')[0] ?? ''
  let ext = clean.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'mp3':
      return 'audio/mpeg'
    case 'm4a':
    case 'm4b':
    case 'mp4':
      return 'audio/mp4'
    case 'aac':
      return 'audio/aac'
    case 'ogg':
    case 'oga':
      return 'audio/ogg'
    case 'opus':
      return 'audio/opus'
    case 'wav':
      return 'audio/wav'
    case 'flac':
      return 'audio/flac'
    case 'webm':
      return 'audio/webm'
    default:
      return ''
  }
}

function buildImetaTag({
  url,
  type,
  duration,
}: {
  url: string
  type?: string
  duration?: string
}) {
  let tag: string[] = ['imeta', `url ${url}`]
  if (type) tag.push(`m ${type}`)
  if (duration) tag.push(`duration ${duration}`)
  return tag
}

function formatDuration(seconds?: number | null) {
  if (!seconds || Number.isNaN(seconds)) return '—'
  return `${Math.max(1, Math.round(seconds / 60))} min`
}

function ShowCard({
  show,
  index,
  onSelect,
}: {
  show: PodcastShow
  index: number
  onSelect: () => void
}) {
  let gradient = gradients[index % gradients.length]

  return (
    <button
      onClick={onSelect}
      className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900/70"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient}`}
        >
          {show.image ? (
            <img src={show.image} alt={show.title} className="h-full w-full object-cover" />
          ) : (
            <MicrophoneIcon className="h-8 w-8 text-white/80" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{show.title}</h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {show.content ?? 'No description yet.'}
          </p>
        </div>
        <ChevronLeftIcon className="h-5 w-5 rotate-180 text-zinc-300 dark:text-zinc-600" />
      </div>
    </button>
  )
}

function EpisodeRow({
  episode,
  onEdit,
}: {
  episode: PodcastEpisode
  onEdit: () => void
}) {
  let date = dayjs.unix(episode.publishedAt).format('MMM D, YYYY')
  let duration = formatDuration(episode.audioVariants[0]?.duration ?? null)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900/70">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10">
          <PlayIcon className="h-4 w-4 translate-x-0.5 text-zinc-600 dark:text-zinc-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{episode.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {date} · {duration}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
          aria-label="Edit episode"
        >
          <PencilSquareIcon className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  )
}

function buildShowTags(show: PodcastShow, title: string) {
  let tags: string[][] = [['d', show.d], ['title', title]]
  if (show.image) tags.push(['image', show.image])
  if (show.frequency) tags.push(['frequency', show.frequency])
  for (let link of show.links) tags.push(['r', link])
  for (let tag of show.tags) tags.push(['t', tag])
  for (let host of show.hosts) tags.push(['p', host])
  for (let external of show.externalIds) tags.push(['i', external])
  return tags
}

function buildEpisodeTags({
  episode,
  title,
  summary,
  publishedAt,
  showAddressTag,
  audioUrl,
  audioType,
  durationMinutes,
}: {
  episode: PodcastEpisode
  title: string
  summary: string
  publishedAt: string
  showAddressTag: string
  audioUrl: string
  audioType?: string
  durationMinutes?: string
}) {
  let publishedTimestamp = Math.floor(new Date(publishedAt).getTime() / 1000).toString()
  let tags: string[][] = [
    ['d', episode.d],
    ['title', title],
    ['published_at', publishedTimestamp],
    ['a', showAddressTag],
  ]

  if (summary.trim()) tags.push(['summary', summary.trim()])
  for (let external of episode.externalIds) tags.push(['i', external])
  for (let tag of episode.tags) tags.push(['t', tag])

  let durationSeconds =
    durationMinutes && Number.isFinite(Number(durationMinutes))
      ? Math.max(1, Math.round(Number(durationMinutes))) * 60
      : undefined

  tags.push(
    buildImetaTag({
      url: audioUrl.trim(),
      type: audioType?.trim() || undefined,
      duration: durationSeconds ? `${durationSeconds}` : undefined,
    }),
  )

  return tags
}

function ShowStudio({
  show,
  onBack,
}: {
  show: PodcastShow
  onBack: () => void
}) {
  let { data: episodes = [], isLoading, error } = useEpisodesForShow(show.addressTag)
  let writeRelays = useRelayStore((state) => state.writeRelays)
  let queryClient = useQueryClient()
  let { data: session } = useSession()
  let user = session?.user as UserWithKeys | undefined
  let secretKey = user?.secretKey ?? undefined

  let [showModalOpen, setShowModalOpen] = useState(false)
  let [episodeModalOpen, setEpisodeModalOpen] = useState(false)
  let [status, setStatus] = useState<string | null>(null)

  let [editShowTitle, setEditShowTitle] = useState(show.title)
  let [editShowDescription, setEditShowDescription] = useState(show.content ?? '')

  let [editEpisode, setEditEpisode] = useState<PodcastEpisode | null>(null)
  let [episodeTitle, setEpisodeTitle] = useState('')
  let [episodeDate, setEpisodeDate] = useState('')
  let [episodeDuration, setEpisodeDuration] = useState('')
  let [episodeSummary, setEpisodeSummary] = useState('')
  let [episodeAudioUrl, setEpisodeAudioUrl] = useState('')
  let [episodeAudioType, setEpisodeAudioType] = useState('')

  function closeEpisodeModal() {
    setEpisodeModalOpen(false)
    setEditEpisode(null)
  }

  function openShowModal() {
    setEditShowTitle(show.title)
    setEditShowDescription(show.content ?? '')
    setShowModalOpen(true)
  }

  function openEpisodeModal(episode: PodcastEpisode) {
    setEditEpisode(episode)
    setEpisodeTitle(episode.title)
    setEpisodeDate(dayjs.unix(episode.publishedAt).format('YYYY-MM-DD'))
    setEpisodeDuration(
      episode.audioVariants[0]?.duration ? `${Math.round(episode.audioVariants[0].duration / 60)}` : '',
    )
    setEpisodeSummary(episode.summary ?? '')
    let audioUrl = episode.audio?.src ?? episode.audioVariants[0]?.url ?? ''
    setEpisodeAudioUrl(audioUrl)
    setEpisodeAudioType(episode.audio?.type ?? inferAudioType(audioUrl))
    setEpisodeModalOpen(true)
  }

  async function saveShow() {
    if (!editShowTitle.trim()) return
    try {
      setStatus(null)
      let tags = buildShowTags(show, editShowTitle.trim())
      let eventTemplate = {
        kind: PODCAST_SHOW_KIND,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: editShowDescription.trim(),
      }
      let signed = await signEventWithKey(eventTemplate, secretKey)
      let results = await publishEvent(signed, writeRelays)
      let successCount = results.filter((r) => r.status === 'fulfilled').length
      let failCount = results.length - successCount
      setStatus(`Saved show. ${successCount} relays ok, ${failCount} failed.`)
      queryClient.invalidateQueries({ queryKey: ['shows-by-author'] })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to update show.')
    } finally {
      setShowModalOpen(false)
    }
  }

  async function saveEpisode() {
    if (!editEpisode || !episodeTitle.trim() || !episodeDate || !episodeAudioUrl.trim()) return
    try {
      setStatus(null)
      let tags = buildEpisodeTags({
        episode: editEpisode,
        title: episodeTitle.trim(),
        summary: episodeSummary,
        publishedAt: episodeDate,
        showAddressTag: show.addressTag,
        audioUrl: episodeAudioUrl,
        audioType: episodeAudioType || inferAudioType(episodeAudioUrl),
        durationMinutes: episodeDuration,
      })
      let eventTemplate = {
        kind: PODCAST_EPISODE_KIND,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: editEpisode.content ?? '',
      }
      let signed = await signEventWithKey(eventTemplate, secretKey)
      let results = await publishEvent(signed, writeRelays)
      let successCount = results.filter((r) => r.status === 'fulfilled').length
      let failCount = results.length - successCount
      setStatus(`Saved episode. ${successCount} relays ok, ${failCount} failed.`)
      queryClient.invalidateQueries({ queryKey: ['episodes'] })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to update episode.')
    } finally {
      closeEpisodeModal()
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        All Shows
      </button>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900/70">
        <div className="flex gap-5">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
            {show.image ? (
              <img src={show.image} alt={show.title} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <MicrophoneIcon className="h-9 w-9 text-white/80" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{show.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {show.content ?? 'No description yet.'}
                </p>
              </div>
              <button
                onClick={openShowModal}
                className="shrink-0 rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                aria-label="Edit show"
              >
                <PencilSquareIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Episodes</h2>
        <Button color="blue" href="/publish" className="rounded-full px-4 py-2 text-sm font-medium">
          <PlusIcon className="h-4 w-4" data-slot="icon" />
          New Episode
        </Button>
      </div>

      {status && <Text className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{status}</Text>}
      {isLoading && <Text>Loading episodes...</Text>}
      {error && <Text className="text-red-600">Failed to load episodes.</Text>}
      {!isLoading && !error && episodes.length === 0 && (
        <Text className="text-sm text-zinc-400">No episodes yet. Create your first one!</Text>
      )}

      <div className="flex flex-col gap-2">
        {episodes.map((episode) => (
          <EpisodeRow key={episode.address} episode={episode} onEdit={() => openEpisodeModal(episode)} />
        ))}
      </div>

      <Dialog open={showModalOpen} onClose={setShowModalOpen} size="lg">
        <DialogTitle>Edit Show</DialogTitle>
        <DialogBody>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Show Title</Label>
                <Input value={editShowTitle} onChange={(event) => setEditShowTitle(event.target.value)} />
              </Field>
              <Field>
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editShowDescription}
                  onChange={(event) => setEditShowDescription(event.target.value)}
                />
              </Field>
            </FieldGroup>
          </Fieldset>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowModalOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={saveShow} disabled={!editShowTitle.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={episodeModalOpen} onClose={closeEpisodeModal} size="lg">
        <DialogTitle>Edit Episode</DialogTitle>
        <DialogBody>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Title</Label>
                <Input value={episodeTitle} onChange={(event) => setEpisodeTitle(event.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={episodeDate}
                    onChange={(event) => setEpisodeDate(event.target.value)}
                  />
                </Field>
                <Field>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={episodeDuration}
                    onChange={(event) => setEpisodeDuration(event.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={episodeSummary}
                  onChange={(event) => setEpisodeSummary(event.target.value)}
                />
              </Field>
              <Field>
                <Label>Audio URL</Label>
                <Input
                  type="url"
                  value={episodeAudioUrl}
                  onChange={(event) => {
                    setEpisodeAudioUrl(event.target.value)
                    setEpisodeAudioType(inferAudioType(event.target.value))
                  }}
                />
              </Field>
            </FieldGroup>
          </Fieldset>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={closeEpisodeModal}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={saveEpisode}
            disabled={!episodeTitle.trim() || !episodeDate || !episodeAudioUrl.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export function Studio() {
  let pubkey = useNostrPubkey()
  let { data: shows = [], isLoading, error } = useShowsByAuthor(pubkey)
  let [selectedShowTag, setSelectedShowTag] = useState<string | null>(null)

  let selectedShow = useMemo(
    () => shows.find((show) => show.addressTag === selectedShowTag) ?? null,
    [shows, selectedShowTag],
  )

  if (!pubkey) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Shows</h1>
        <Text className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Connect Nostr to manage your shows and episodes.
        </Text>
      </div>
    )
  }

  if (selectedShow) {
    return <ShowStudio show={selectedShow} onBack={() => setSelectedShowTag(null)} />
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Shows</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Select a show to manage.</p>
        </div>
        <Button color="blue" href="/publish" className="rounded-full px-4 py-2 text-sm font-medium">
          <PlusIcon className="h-4 w-4" data-slot="icon" />
          New Show
        </Button>
      </div>

      {isLoading && <Text>Loading your shows...</Text>}
      {error && <Text className="text-red-600">Failed to load your shows.</Text>}
      {!isLoading && !error && shows.length === 0 && (
        <Text className="text-sm text-zinc-400">No shows yet. Create your first one!</Text>
      )}

      <div className="grid gap-4">
        {shows.map((show, index) => (
          <ShowCard key={show.address} show={show} index={index} onSelect={() => setSelectedShowTag(show.addressTag)} />
        ))}
      </div>
    </div>
  )
}
