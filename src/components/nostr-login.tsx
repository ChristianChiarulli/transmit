'use client'

import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Avatar } from '@/components/avatar'
import { useProfile } from '@/hooks/useProfile'
import { NavbarItem, NavbarLabel } from '@/components/navbar'
import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { Button } from '@/components/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/20/solid'
import type { UserWithKeys } from '@/types/auth'

function formatPubkey(pubkey: string) {
  return `${pubkey.slice(0, 10)}…${pubkey.slice(-6)}`
}

export function NostrLogin({ variant = 'sidebar' }: { variant?: 'sidebar' | 'navbar' }) {
  let router = useRouter()
  let pathname = usePathname()
  let { data: session, status } = useSession()
  let user = session?.user as UserWithKeys | undefined
  let pubkey = user?.publicKey ?? null
  let { data: profile } = useProfile(pubkey)

  function handleLogin() {
    let callbackUrl = encodeURIComponent(pathname || '/')
    router.push(`/login?callbackUrl=${callbackUrl}`)
  }

  async function handleLogout() {
    await signOut({ redirect: false })
  }

  if (status === 'loading') {
    return variant === 'navbar' ? (
      <NavbarItem disabled>
        <UserIcon />
      </NavbarItem>
    ) : (
      <SidebarItem disabled>
        <UserIcon />
        <SidebarLabel>Loading…</SidebarLabel>
      </SidebarItem>
    )
  }

  if (!pubkey) {
    return variant === 'navbar' ? (
      <Button onClick={handleLogin} color="dark/zinc" className="px-3 py-1.5 text-sm">
        Login
      </Button>
    ) : (
      <Button onClick={handleLogin} color="dark/zinc" className="w-full justify-center">
        Login
      </Button>
    )
  }

  let avatar = profile?.picture ? (
    <Avatar src={profile.picture} alt={profile.displayName ?? profile.name ?? 'Profile'} />
  ) : (
    <UserIcon />
  )

  if (variant === 'navbar') {
    return (
      <Dropdown>
        <DropdownButton as={NavbarItem}>{avatar}</DropdownButton>
        <DropdownMenu anchor="bottom end">
          <DropdownItem onClick={handleLogout}>
            <ArrowRightOnRectangleIcon />
            <DropdownLabel>Logout</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>{avatar}</DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownItem onClick={handleLogout}>
          <ArrowRightOnRectangleIcon />
          <DropdownLabel>Logout</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
