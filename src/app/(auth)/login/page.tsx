'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { nip19, getPublicKey } from 'nostr-tools'
import { bytesToHex } from 'nostr-tools/utils'
import { useQueryClient } from '@tanstack/react-query'

import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Fieldset, Label, ErrorMessage } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'

const extensionErrorMessage = 'No Nostr extension found. Install Alby or nos2x.'

function isValidNsec(value: string) {
  try {
    return nip19.decode(value).type === 'nsec'
  } catch {
    return false
  }
}

function LoginContent() {
  let router = useRouter()
  let searchParams = useSearchParams()
  let callbackUrl = searchParams.get('callbackUrl') || '/'
  let queryClient = useQueryClient()

  let [nsec, setNsec] = useState('')
  let [isLoading, setIsLoading] = useState(false)
  let [formError, setFormError] = useState<string | null>(null)
  let [extensionError, setExtensionError] = useState<string | null>(null)

  async function handleExtensionLogin() {
    setIsLoading(true)
    setExtensionError(null)
    setFormError(null)

    if (typeof window === 'undefined' || !window.nostr?.getPublicKey) {
      setExtensionError(extensionErrorMessage)
      setIsLoading(false)
      return
    }

    try {
      let publicKey = await window.nostr.getPublicKey()
      await queryClient.invalidateQueries()
      await signIn('credentials', {
        publicKey,
        secretKey: '',
        redirect: false,
      })
      router.push(callbackUrl)
    } catch (error) {
      console.error('NIP-07 login failed', error)
      setExtensionError('Failed to get public key from extension.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleNsecSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setExtensionError(null)

    if (!isValidNsec(nsec)) {
      setFormError('Invalid nsec.')
      return
    }

    setIsLoading(true)
    try {
      let secretKeyBytes = nip19.decode(nsec).data as Uint8Array
      let publicKey = getPublicKey(secretKeyBytes)
      let secretKey = bytesToHex(secretKeyBytes)

      await queryClient.invalidateQueries()
      await signIn('credentials', {
        publicKey,
        secretKey,
        redirect: false,
      })
      router.push(callbackUrl)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid w-full max-w-sm gap-8">
      <div className="flex flex-col gap-3 text-center">
        <Logo className="mx-auto h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
        <Heading>Sign in with Nostr</Heading>
        <Text className="text-sm/6 text-zinc-600 dark:text-zinc-400">Use your Nostr identity to continue.</Text>
      </div>

      <Button type="button" color="light" onClick={handleExtensionLogin} disabled={isLoading}>
        Sign in with extension
      </Button>

      {extensionError && <Text className="text-center text-sm text-red-600">{extensionError}</Text>}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">Or continue with</span>
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleNsecSubmit}>
        <Fieldset>
          <Field>
            <Label>Nostr secret key</Label>
            <Input
              type="password"
              placeholder="nsec..."
              value={nsec}
              onChange={(event) => setNsec(event.target.value)}
              disabled={isLoading}
            />
            {formError && <ErrorMessage>{formError}</ErrorMessage>}
          </Field>
        </Fieldset>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in with nsec'}
        </Button>
      </form>

      <Text className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Your nsec is only stored in your browser session and never sent to any server.
      </Text>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="mx-auto grid w-full max-w-sm gap-8">Loading…</div>}>
      <LoginContent />
    </Suspense>
  )
}
