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
    <div className="mx-auto max-w-4xl">
      <Heading>Publish</Heading>
      <Divider className="my-6" />
      <div className="mt-6 flex gap-2">
        <Button plain={activeTab !== 'show'} onClick={() => setActiveTab('show')}>
          Show
        </Button>
        <Button plain={activeTab !== 'episode'} onClick={() => setActiveTab('episode')}>
          Episode
        </Button>
      </div>
      <div className="mt-8">
        {activeTab === 'show' ? <PublishShowForm /> : <PublishEpisodeForm />}
      </div>
    </div>
  )
}
