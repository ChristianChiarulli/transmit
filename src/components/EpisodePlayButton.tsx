'use client'

import { useAudioPlayer } from '@/components/AudioProvider'
import type { PodcastEpisode } from '@/lib/nostr/podcasts'

export function EpisodePlayButton({
  episode,
  playing,
  paused,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & {
  episode: PodcastEpisode
  playing: React.ReactNode
  paused: React.ReactNode
}) {
  let player = useAudioPlayer(episode)

  return (
    <button
      type="button"
      onClick={() => player.toggle()}
      aria-label={`${player.playing ? 'Pause' : 'Play'} episode ${episode.title}`}
      {...props}
    >
      {player.playing ? playing : paused}
    </button>
  )
}
