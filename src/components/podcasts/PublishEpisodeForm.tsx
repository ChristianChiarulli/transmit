'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/button'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'
import { Text } from '@/components/text'
import { useShows } from '@/hooks/usePodcasts'
import { useRelayStore } from '@/state/relayStore'
import { publishEvent, signEvent } from '@/lib/nostr/publish'
import { PODCAST_EPISODE_KIND } from '@/lib/nostr/podcasts'

function buildImetaTag({
  url,
  type,
  hash,
  duration,
  image,
  bitrate,
  size,
}: {
  url: string
  type?: string
  hash?: string
  duration?: string
  image?: string
  bitrate?: string
  size?: string
}) {
  let tag: string[] = ['imeta', `url ${url}`]
  if (type) tag.push(`m ${type}`)
  if (hash) tag.push(`x ${hash}`)
  if (duration) tag.push(`duration ${duration}`)
  if (bitrate) tag.push(`bitrate ${bitrate}`)
  if (size) tag.push(`size ${size}`)
  if (image) tag.push(`image ${image}`)
  return tag
}

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

export function PublishEpisodeForm() {
  let { data: shows } = useShows()
  let writeRelays = useRelayStore((state) => state.writeRelays)
  let [showAddressTag, setShowAddressTag] = useState('')
  let [title, setTitle] = useState('')
  let [summary, setSummary] = useState('')
  let [content, setContent] = useState('')
  let [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10))
  let [episodeGuid, setEpisodeGuid] = useState('')
  let [audioUrl, setAudioUrl] = useState('')
  let [audioType, setAudioType] = useState('')
  let [tags, setTags] = useState<string[]>([])
  let [tagInput, setTagInput] = useState('')
  let [status, setStatus] = useState<string | null>(null)
  let [isSubmitting, setIsSubmitting] = useState(false)

  let selectedShow = useMemo(
    () => shows?.find((show) => show.addressTag === showAddressTag) ?? null,
    [shows, showAddressTag],
  )

  useEffect(() => {
    if (!showAddressTag && shows?.length) {
      setShowAddressTag(shows[0].addressTag)
    }
  }, [showAddressTag, shows])

  useEffect(() => {
    if (!episodeGuid) {
      let guid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `episode-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setEpisodeGuid(guid)
    }
  }, [episodeGuid])

  useEffect(() => {
    if (!audioUrl.trim()) return
    setAudioType(inferAudioType(audioUrl.trim()))
  }, [audioUrl])

  function addTag(value: string) {
    let next = value.trim().replace(/^#/, '')
    if (!next || tags.includes(next)) return
    setTags((prev) => [...prev, next])
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addTag(tagInput)
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((item) => item !== tag))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !showAddressTag || !audioUrl.trim()) {
      setStatus('Title, show, and audio URL are required.')
      return
    }
    if (Number.isNaN(Date.parse(publishedAt))) {
      setStatus('Published date is invalid.')
      return
    }

    let dValue = episodeGuid.trim()
      ? `podcast:item:guid:${episodeGuid.trim()}`
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    let publishedTimestamp = Math.floor(new Date(publishedAt).getTime() / 1000).toString()

    let tagsList: string[][] = [
      ['d', dValue],
      ['title', title.trim()],
      ['published_at', publishedTimestamp],
      ['a', showAddressTag],
    ]

    if (summary.trim()) tagsList.push(['summary', summary.trim()])
    if (episodeGuid.trim()) tagsList.push(['i', `podcast:item:guid:${episodeGuid.trim()}`])

    let showGuid = selectedShow?.externalIds.find((id) => id.startsWith('podcast:guid:'))
    if (showGuid) tagsList.push(['i', showGuid])

    for (let tag of tags) tagsList.push(['t', tag])

    tagsList.push(
      buildImetaTag({
        url: audioUrl.trim(),
        type: audioType.trim() || undefined,
      }),
    )

    setIsSubmitting(true)
    setStatus(null)

    try {
      let createdAt = Math.floor(Date.now() / 1000)
      let eventTemplate = {
        kind: PODCAST_EPISODE_KIND,
        created_at: createdAt,
        tags: tagsList,
        content: content.trim(),
      }

      let signedEvent = await signEvent(eventTemplate)
      let results = await publishEvent(signedEvent, writeRelays)

      let successCount = results.filter((r) => r.status === 'fulfilled').length
      let failCount = results.length - successCount
      setStatus(`Published to ${successCount} relays. ${failCount} failed.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to publish episode.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Show</Label>
            <Select value={showAddressTag} onChange={(event) => setShowAddressTag(event.target.value)} required>
              <option value="" disabled>
                {shows?.length ? 'Select a show' : 'No shows available'}
              </option>
              {shows?.map((show) => (
                <option key={show.addressTag} value={show.addressTag}>
                  {show.title}
                </option>
              ))}
            </Select>
            {!shows?.length && (
              <Text className="mt-2">No shows found on this relay. Publish a show first.</Text>
            )}
          </Field>
          <Field>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>
          <Field>
            <Label>Summary</Label>
            <Input value={summary} onChange={(event) => setSummary(event.target.value)} />
          </Field>
          <Field>
            <Label>Published date</Label>
            <Input type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} required />
          </Field>
          <Field>
            <Label>Show notes (Markdown)</Label>
            <Textarea rows={4} value={content} onChange={(event) => setContent(event.target.value)} />
          </Field>
          <Field>
            <Label>Audio URL</Label>
            <Input type="url" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} required />
          </Field>
          <Field>
            <Label>Tags</Label>
            <Input
              value={tagInput}
              placeholder="Type a tag and press Enter"
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 transition hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </Field>
        </FieldGroup>
      </Fieldset>
      {status && <Text className="mt-4">{status}</Text>}
      <div className="mt-6">
        <Button type="submit" color="dark" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish episode'}
        </Button>
      </div>
    </form>
  )
}
