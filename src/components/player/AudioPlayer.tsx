'use client'

import { useEffect, useRef, useState } from 'react'

import { useAudioPlayer } from '@/components/AudioProvider'
import { ForwardButton } from '@/components/player/ForwardButton'
import { MuteButton } from '@/components/player/MuteButton'
import { PlayButton } from '@/components/player/PlayButton'
import { RewindButton } from '@/components/player/RewindButton'
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

export function AudioPlayer({ className }: { className?: string }) {
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
    <div className={`w-full bg-transparent text-zinc-900 dark:text-white ${className ?? ''}`}>
      <div className="flex w-full items-center gap-6 px-0">
        <div className="mb-[env(safe-area-inset-bottom)] flex flex-1 flex-col gap-3 overflow-hidden">
          {/*<Link
            href={`/episodes/${player.episode.id}`}
            className="truncate text-center text-xs/5 font-bold text-slate-900 md:text-left dark:text-white"
            title={player.episode.title}
          >
            {player.episode.title}
          </Link>*/}
          <div className="flex origin-left scale-90 justify-between gap-6">
            {/*<div className="flex items-center">
              <PlaybackRateButton player={player} />
            </div>*/}
            <div className="flex flex-none items-center gap-4">
              <RewindButton player={player} />
              <div>
                <PlayButton player={player} />
              </div>
              <ForwardButton player={player} />
            </div>
            <div className="flex-1">
              <Slider
                label="Current time"
                maxValue={player.duration}
                step={1}
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
            <div className="flex items-center gap-4">
              <div className="hidden items-center md:flex">
                <MuteButton player={player} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
