'use client'

import { Avatar } from '@/components/avatar'
import { Link } from '@/components/link'
import { Text } from '@/components/text'

export function ShowCard({
  title,
  description,
  image,
  href,
  tags,
}: {
  title: string
  description: string
  image?: string
  href: string
  tags: string[]
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
      <Avatar src={image ?? null} square className="size-14" alt={title} />
      <div className="min-w-0 flex-1">
        <Link href={href} className="text-base/6 font-semibold text-zinc-950 dark:text-white">
          {title}
        </Link>
        <Text className="mt-1 line-clamp-2">{description}</Text>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
