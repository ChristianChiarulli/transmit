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
import { MusicalNoteIcon } from '@heroicons/react/20/solid'

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

  let hasEpisode = Boolean(player.episode)

  return (
    <div className="flex w-full flex-1 justify-between gap-6 py-1">
      <div className="hidden flex-1 justify-center sm:flex">
        <div className={`flex flex-none items-center gap-4 pl-2 md:pl-6 ${hasEpisode ? '' : 'pointer-events-none opacity-40'}`}>
          <RewindButton player={player} />
          <div>
            <PlayButton player={player} />
          </div>
          <ForwardButton player={player} />
        </div>
      </div>
      <div className="hidden min-h-12 max-w-lg flex-1 flex-col rounded bg-zinc-100 sm:flex sm:min-w-xs md:min-w-sm lg:min-w-sm xl:min-w-lg dark:bg-zinc-800">
        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          {player.episode ? (
            <p className="truncate text-xs/5 font-bold text-zinc-900 dark:text-white select-none">
              {player.episode.title}
            </p>
          ) : (
            <MusicalNoteIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          )}
          {player.episode?.showTitle ? (
            player.episode.showAddress ? (
              <Link
                href={`/shows/${player.episode.showAddress}`}
                className="truncate text-[11px]/5 text-zinc-600 hover:underline dark:text-zinc-400"
              >
                {player.episode.showTitle}
              </Link>
            ) : (
              <p className="truncate text-[11px]/5 text-zinc-500 dark:text-zinc-400">{player.episode.showTitle}</p>
            )
          ) : null}
        </div>
        <Slider
          label="Current time"
          maxValue={player.duration}
          step={1}
          showOutput={false}
          value={[currentTime ?? player.currentTime]}
          isDisabled={!hasEpisode}
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
      <div className="hidden flex-1 items-center justify-start gap-4 lg:flex">
        <div className={`flex items-center ${hasEpisode ? '' : 'pointer-events-none opacity-40'}`}>
          <MuteButton player={player} />
        </div>
      </div>

      <div className="flex items-center gap-4 pr-2 md:pr-6">
        <ThemeSwitcher compact />
        <NostrLogin variant="navbar" />
      </div>
    </div>
  )
}
