'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/button'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'
import { Text } from '@/components/text'
import { useRelayStore } from '@/state/relayStore'
import { publishEvent, signEvent } from '@/lib/nostr/publish'
import { PODCAST_SHOW_KIND } from '@/lib/nostr/podcasts'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function PublishShowForm() {
  let writeRelays = useRelayStore((state) => state.writeRelays)
  let [title, setTitle] = useState('')
  let [description, setDescription] = useState('')
  let [image, setImage] = useState('')
  let [frequency, setFrequency] = useState('weekly')
  let [showGuid, setShowGuid] = useState('')
  let [tags, setTags] = useState<string[]>([])
  let [tagInput, setTagInput] = useState('')
  let [pubkey, setPubkey] = useState<string | null>(null)
  let [status, setStatus] = useState<string | null>(null)
  let [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!showGuid) {
      let guid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `show-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setShowGuid(guid)
    }

    let storedPubkey = window.localStorage.getItem('nostr-pubkey')
    if (storedPubkey) setPubkey(storedPubkey)
  }, [showGuid])

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
    if (!title.trim()) {
      setStatus('Title is required.')
      return
    }

    let dValue = showGuid ? `podcast:guid:${showGuid.trim()}` : slugify(title)

    let tagsList: string[][] = [['d', dValue], ['title', title.trim()]]

    if (image.trim()) tagsList.push(['image', image.trim()])
    if (frequency.trim()) tagsList.push(['frequency', frequency.trim()])
    if (showGuid.trim()) tagsList.push(['i', `podcast:guid:${showGuid.trim()}`])
    if (pubkey) tagsList.push(['p', pubkey])
    for (let tag of tags) tagsList.push(['t', tag])

    setIsSubmitting(true)
    setStatus(null)

    try {
      let eventTemplate = {
        kind: PODCAST_SHOW_KIND,
        created_at: Math.floor(Date.now() / 1000),
        tags: tagsList,
        content: description.trim(),
      }

      let signedEvent = await signEvent(eventTemplate)
      let results = await publishEvent(signedEvent, writeRelays)

      let successCount = results.filter((r) => r.status === 'fulfilled').length
      let failCount = results.length - successCount
      setStatus(`Published to ${successCount} relays. ${failCount} failed.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to publish show.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Field>
            <Label>Image URL</Label>
            <Input type="url" value={image} onChange={(event) => setImage(event.target.value)} />
          </Field>
          <Field>
            <Label>Frequency</Label>
            <Select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
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
          {isSubmitting ? 'Publishing...' : 'Publish show'}
        </Button>
      </div>
    </form>
  )
}
