'use client'

import { useSession } from 'next-auth/react'
import type { UserWithKeys } from '@/types/auth'

export function useNostrPubkey() {
  let { data: session } = useSession()
  let user = session?.user as UserWithKeys | undefined
  return user?.publicKey ?? null
}
