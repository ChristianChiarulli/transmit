'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/components/link'

import { useAudioPlayer } from '@/components/AudioProvider'
import { ForwardButton } from '@/components/player/ForwardButton'
import { MuteButton } from '@/components/player/MuteButton'
import { PlaybackRateButton } from '@/components/player/PlaybackRateButton'
import { PlayButton } from '@/components/player/PlayButton'
import { RewindButton } from '@/components/player/RewindButton'
import { Slider } from '@/components/player/Slider'
import { XMarkIcon } from '@heroicons/react/20/solid'

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

export function AudioPlayer() {
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
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 shadow-sm shadow-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/90 lg:left-64">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 md:px-6">
        <div className="hidden md:block">
          <PlayButton player={player} />
        </div>
        <div className="mb-[env(safe-area-inset-bottom)] flex flex-1 flex-col gap-3 overflow-hidden p-1">
          <Link
            href={`/episodes/${player.episode.id}`}
            className="truncate text-center text-sm/6 font-bold text-slate-900 md:text-left dark:text-white"
            title={player.episode.title}
          >
            {player.episode.title}
          </Link>
          <div className="flex justify-between gap-6">
            <div className="flex items-center md:hidden">
              <MuteButton player={player} />
            </div>
            <div className="flex flex-none items-center gap-4">
              <RewindButton player={player} />
              <div className="md:hidden">
                <PlayButton player={player} />
              </div>
              <ForwardButton player={player} />
            </div>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <PlaybackRateButton player={player} />
            </div>
            <div className="hidden items-center md:flex">
              <MuteButton player={player} />
            </div>
            <button
              type="button"
              className="group relative rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-hidden md:order-0"
              onClick={() => player.clear()}
              aria-label="Close player"
            >
              <div className="absolute -inset-4 md:hidden" />
              <XMarkIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
