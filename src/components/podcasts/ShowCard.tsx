'use client'

import { Avatar } from '@/components/avatar'
import { Link } from '@/components/link'
import { Text } from '@/components/text'

export function ShowCard({
  title,
  image,
  href,
  tags,
}: {
  title: string
  image?: string
  href: string
  tags: string[]
}) {
  return (
    <Link href={href} className="group block w-48 flex-none cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition dark:border-zinc-500/50 dark:bg-zinc-900">
        {image ? (
          <>
            <img src={image} alt={title} className="aspect-square w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-zinc-950/0 transition group-hover:bg-zinc-950/10 dark:group-hover:bg-zinc-950/30" />
          </>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
            No image
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-base/6 font-semibold text-zinc-950 dark:text-white">{title}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
