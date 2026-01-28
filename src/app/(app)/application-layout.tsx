'use client'

import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown'
import { Navbar, NavbarLabel, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Input } from '@/components/input'
import { NostrLogin } from '@/components/nostr-login'
import { SidebarShowList } from '@/components/podcasts/SidebarShowList'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { useRelayStore } from '@/state/relayStore'
import { ChevronDownIcon, HomeIcon, PencilSquareIcon, ServerStackIcon } from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function formatRelayLabel(relay: string | null) {
  if (!relay) return 'Select relay'
  return relay.replace(/^wss?:\/\//, '')
}

function RelayDropdown() {
  let readRelay = useRelayStore((state) => state.readRelay)
  let writeRelays = useRelayStore((state) => state.writeRelays)
  let setReadRelay = useRelayStore((state) => state.setReadRelay)
  let addRelay = useRelayStore((state) => state.addRelay)
  let [isOpen, setIsOpen] = useState(false)
  let [newRelay, setNewRelay] = useState('')

  function handleAddRelay() {
    if (!newRelay.trim()) return
    addRelay(newRelay)
    setNewRelay('')
    setIsOpen(false)
  }

  return (
    <>
      <Dropdown>
        <DropdownButton as={SidebarItem}>
          <ServerStackIcon />
          <SidebarLabel>{formatRelayLabel(readRelay)}</SidebarLabel>
          <ChevronDownIcon />
        </DropdownButton>
        <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
          {writeRelays.length === 0 && (
            <DropdownItem>
              <DropdownLabel>No relays configured</DropdownLabel>
            </DropdownItem>
          )}
          {writeRelays.map((relay) => (
            <DropdownItem key={relay} onClick={() => setReadRelay(relay)}>
              <DropdownLabel>{relay}</DropdownLabel>
            </DropdownItem>
          ))}
          <DropdownDivider />
          <DropdownItem onClick={() => setIsOpen(true)}>
            <ServerStackIcon />
            <DropdownLabel>Add relay</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Add relay</DialogTitle>
        <DialogDescription>Relays are added as publish targets. You can switch the active read relay above.</DialogDescription>
        <DialogBody>
          <Input
            autoFocus
            placeholder="relay.damus.io"
            value={newRelay}
            onChange={(event) => setNewRelay(event.target.value)}
          />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button color="dark" onClick={handleAddRelay} disabled={!newRelay.trim()}>
            Add relay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarLabel>Podcast NIP Demo</NavbarLabel>
          </NavbarSection>
          <NavbarSpacer />
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <RelayDropdown />
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/publish" current={pathname.startsWith('/publish')}>
                <PencilSquareIcon />
                <SidebarLabel>Publish</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarShowList />
          </SidebarBody>
          <SidebarFooter>
            <SidebarSection>
              <ThemeSwitcher />
              <NostrLogin />
            </SidebarSection>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
