import { type PlayerAPI } from '@/components/AudioProvider'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'

export function PlayButton({ player }: { player: PlayerAPI }) {
  let Icon = player.playing ? PauseIcon : PlayIcon
  return (
    <button
      type="button"
      className={`group relative flex shrink-0 items-center justify-center text-zinc-400 hover:cursor-pointer focus:outline-hidden hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-200`}
      onClick={() => player.toggle()}
      aria-label={player.playing ? 'Pause' : 'Play'}
    >
      <div className="absolute -inset-3 md:hidden" />
      <Icon
        className={`h-4 w-4 fill-current group-active:opacity-80 md:h-6 md:w-6 ${
          player.playing ? '' : 'translate-x-1'
        } `}
      />
    </button>
  )
}
