import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    template: '%s – Transmit',
    default: 'Transmit',
  },
  description: 'Publish and manage Nostr podcasts. Create shows, publish episodes, and distribute to relays.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    title: 'Transmit',
    description: 'Publish and manage Nostr podcasts. Create shows, publish episodes, and distribute to relays.',
  },
  twitter: {
    card: 'summary',
    title: 'Transmit',
    description: 'Publish and manage Nostr podcasts. Create shows, publish episodes, and distribute to relays.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {}
})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
