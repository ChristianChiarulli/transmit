import { type PlayerAPI } from '@/components/AudioProvider'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'

export function PlayButton({ player }: { player: PlayerAPI }) {
  let Icon = player.playing ? PauseIcon : PlayIcon
  return (
    <button
      type="button"
      className={`group relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-hidden`}
      onClick={() => player.toggle()}
      aria-label={player.playing ? 'Pause' : 'Play'}
    >
      <div className="absolute -inset-3 md:hidden" />
      <Icon
        className={`h-4 w-4 fill-current group-active:opacity-80 md:h-6 md:w-6 ${
          player.playing ? '' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
