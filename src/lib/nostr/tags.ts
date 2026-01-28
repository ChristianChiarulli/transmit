export type Tag = string[]

export function getTagValue(tags: Tag[], name: string) {
  return tags.find((tag) => tag[0] === name)?.[1]
}

export function getTagValues(tags: Tag[], name: string) {
  return tags.filter((tag) => tag[0] === name).map((tag) => tag[1])
}

export type Imeta = Record<string, string[]>

export function parseImetaTag(tag: Tag): Imeta {
  let entries = tag.slice(1)
  let imeta: Imeta = {}

  for (let entry of entries) {
    let [key, ...rest] = entry.split(' ')
    if (!key) continue
    let value = rest.join(' ').trim()
    if (!value) continue
    if (!imeta[key]) imeta[key] = []
    imeta[key].push(value)
  }

  return imeta
}

export function getFirst(imeta: Imeta, key: string) {
  return imeta[key]?.[0]
}

export function toNumber(value: string | undefined) {
  if (!value) return null
  let parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
