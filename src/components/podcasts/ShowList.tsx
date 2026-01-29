'use client'

import { Heading, Subheading } from '@/components/heading'
import { Divider } from '@/components/divider'
import { Text } from '@/components/text'
import { useShows } from '@/hooks/usePodcasts'
import { ShowCard } from '@/components/podcasts/ShowCard'

export function ShowList() {
  let { data, isLoading, error } = useShows()

  return (
    <div className="mx-auto">
      <Heading>Home</Heading>
      <Subheading className="mt-8">Latest</Subheading>
      {isLoading && <Text className="mt-4">Loading shows...</Text>}
      {error && <Text className="mt-4 text-red-600">Failed to load shows from this relay.</Text>}
      {!isLoading && !error && data?.length === 0 && (
        <Text className="mt-4">No shows found yet. Publish one to get started.</Text>
      )}
      <div className="mt-6 flex flex-wrap gap-6">
        {data?.map((show) => (
          <ShowCard
            key={show.address}
            title={show.title}
            image={show.image}
            href={`/shows/${show.address}`}
            tags={show.tags}
          />
        ))}
      </div>
    </div>
  )
}
