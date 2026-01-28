'use client'

import { Switch } from '@/components/switch'
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  let stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeSwitcher() {
  let [theme, setTheme] = useState<ThemeMode | null>(null)

  useEffect(() => {
    let preferred = getPreferredTheme()
    setTheme(preferred)
    applyTheme(preferred)
  }, [])

  function toggleTheme(nextChecked: boolean) {
    let nextTheme: ThemeMode = nextChecked ? 'dark' : 'light'
    setTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
  }

  let isDark = theme === 'dark'

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm/5 font-medium text-zinc-600 dark:text-zinc-300">
      <div className="flex items-center gap-2">
        {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
        <span>Theme</span>
      </div>
      <Switch checked={isDark} onChange={toggleTheme} color="dark/zinc" disabled={theme === null} />
    </div>
  )
}
