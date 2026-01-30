'use client'

import { useState } from 'react'

import { Heading } from '@/components/heading'
import { Divider } from '@/components/divider'
import { PublishEpisodeForm } from '@/components/podcasts/PublishEpisodeForm'
import { PublishShowForm } from '@/components/podcasts/PublishShowForm'
import { Button } from '@/components/button'

type Tab = 'show' | 'episode'

export default function PublishPage() {
  let [activeTab, setActiveTab] = useState<Tab>('show')

  return (
    <div className="mx-auto max-w-2xl">
      <Heading>Publish</Heading>
      <Divider className="my-6" />
      <div className="mt-6 flex gap-2">
        <Button
          plain
          onClick={() => setActiveTab('show')}
          className={activeTab === 'show' ? 'bg-zinc-950/5 dark:bg-white/10' : 'text-zinc-500 dark:text-zinc-400'}
        >
          Show
        </Button>
        <Button
          plain
          onClick={() => setActiveTab('episode')}
          className={activeTab === 'episode' ? 'bg-zinc-950/5 dark:bg-white/10' : 'text-zinc-500 dark:text-zinc-400'}
        >
          Episode
        </Button>
      </div>
      <div className="mt-8">
        {activeTab === 'show' ? <PublishShowForm /> : <PublishEpisodeForm />}
      </div>
    </div>
  )
}
