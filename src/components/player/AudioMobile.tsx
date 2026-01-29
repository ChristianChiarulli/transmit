'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { useAudioPlayer } from '@/components/AudioProvider'
import { PlayButton } from '@/components/player/PlayButton'
import { Slider } from '@/components/player/Slider'

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

export function AudioMobile() {
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur sm:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="flex items-center gap-3 px-4 pt-3">
        <PlayButton player={player} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm/5 font-semibold text-zinc-900 dark:text-white">{player.episode.title}</p>
          {player.episode.showTitle && player.episode.showAddress ? (
            <Link
              href={`/shows/${player.episode.showAddress}`}
              className="truncate text-xs text-zinc-500 dark:text-zinc-400"
            >
              {player.episode.showTitle}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2">
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
    </div>
  )
}
