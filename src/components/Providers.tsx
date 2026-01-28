'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AudioProvider } from '@/components/AudioProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  let [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <AudioProvider>{children}</AudioProvider>
    </QueryClientProvider>
  )
}
