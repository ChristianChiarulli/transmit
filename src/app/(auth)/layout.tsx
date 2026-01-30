import { AuthLayout } from '@/components/auth-layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
