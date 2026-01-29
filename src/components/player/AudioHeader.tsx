'use client'

import { useEffect, useRef, useState } from 'react'

import { useAudioPlayer } from '@/components/AudioProvider'
import { ForwardButton } from '@/components/player/ForwardButton'
import { MuteButton } from '@/components/player/MuteButton'
import { PlayButton } from '@/components/player/PlayButton'
import { RewindButton } from '@/components/player/RewindButton'
import { Slider } from '@/components/player/Slider'
import Link from 'next/link'
import { NostrLogin } from '../nostr-login'
import { ThemeSwitcher } from '../theme-switcher'

function parseTime(seconds: number) {
  let hours = Math.floor(seconds / 3600)
  let minutes = Math.floor((seconds - hours * 3600) / 60)
  seconds = seconds - hours * 3600 - minutes * 60
  return [hours, minutes, seconds]
}

function formatHumanTime(seconds: number) {
  let [h, m, s] = parseTime(seconds)
  return `${h} hour${h === 1 ? '' : 's'}, ${m} minute${m === 1 ? '' : 's'}, ${s} second${s === 1 ? '' : 's'}`
}

export function AudioHeader({ className }: { className?: string }) {
  let player = useAudioPlayer()
  let wasPlayingRef = useRef(false)
  let [currentTime, setCurrentTime] = useState<number | null>(player.currentTime)

  useEffect(() => {
    setCurrentTime(null)
  }, [player.currentTime])

  if (!player.episode) {
    return null
  }

  return (
    <div className="flex justify-between gap-6 w-full flex-1 py-1">
      <div className="flex flex-1 justify-center">
        <div className="flex flex-none items-center gap-4 py-4">
          <RewindButton player={player} />
          <div>
            <PlayButton player={player} />
          </div>
          <ForwardButton player={player} />
        </div>
      </div>
      <div className="flex max-w-lg flex-1 flex-col rounded bg-zinc-800 xl:min-w-lg">
        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <Link
            href={`/episodes/${player.episode.id}`}
            className="truncate text-xs/5 font-bold text-slate-900 dark:text-white"
            title={player.episode.title}
          >
            {player.episode.title}
          </Link>
          {player.episode.showTitle ? (
            <p className="truncate text-[11px]/5 text-zinc-500 dark:text-zinc-400">{player.episode.showTitle}</p>
          ) : null}
        </div>
        <Slider
          label="Current time"
          maxValue={player.duration}
          step={1}
          showOutput={false}
          value={[currentTime ?? player.currentTime]}
          onChange={([value]) => setCurrentTime(value)}
          onChangeEnd={([value]) => {
            player.seek(value)
            if (wasPlayingRef.current) {
              player.play()
            }
          }}
          numberFormatter={{ format: formatHumanTime } as Intl.NumberFormat}
          onChangeStart={() => {
            wasPlayingRef.current = player.playing
            player.pause()
          }}
        />
      </div>
      <div className="flex flex-1 items-center justify-start gap-4">
        <div className="flex items-center">
          <MuteButton player={player} />
        </div>
      </div>

      <div className="flex gap-4 pr-6 items-center">
        <ThemeSwitcher compact />
        <NostrLogin variant="navbar" />
      </div>
    </div>
  )
}
