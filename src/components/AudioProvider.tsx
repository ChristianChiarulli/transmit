'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import type { PodcastEpisode } from '@/lib/nostr/podcasts'
import { Howl } from 'howler'

export type PlayerEpisode = {
  id: string
  title: string
  showTitle?: string
  showAddress?: string
  audio: { src: string }
}

interface PlayerState {
  playing: boolean
  muted: boolean
  duration: number
  currentTime: number
  episode: PlayerEpisode | null
}

interface PublicPlayerActions {
  play: (episode?: PlayerEpisode) => void
  pause: () => void
  toggle: (episode?: PlayerEpisode) => void
  seekBy: (amount: number) => void
  seek: (time: number) => void
  playbackRate: (rate: number) => void
  toggleMute: () => void
  clear: () => void
  isPlaying: (episode?: PlayerEpisode) => boolean
}

export type PlayerAPI = PlayerState & PublicPlayerActions

const enum ActionKind {
  SET_META = 'SET_META',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  TOGGLE_MUTE = 'TOGGLE_MUTE',
  SET_CURRENT_TIME = 'SET_CURRENT_TIME',
  SET_DURATION = 'SET_DURATION',
  CLEAR = 'CLEAR',
}

type Action =
  | { type: ActionKind.SET_META; payload: PlayerEpisode }
  | { type: ActionKind.PLAY }
  | { type: ActionKind.PAUSE }
  | { type: ActionKind.TOGGLE_MUTE }
  | { type: ActionKind.SET_CURRENT_TIME; payload: number }
  | { type: ActionKind.SET_DURATION; payload: number }
  | { type: ActionKind.CLEAR }

const AudioPlayerContext = createContext<PlayerAPI | null>(null)

function audioReducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case ActionKind.SET_META:
      return { ...state, episode: action.payload }
    case ActionKind.PLAY:
      return { ...state, playing: true }
    case ActionKind.PAUSE:
      return { ...state, playing: false }
    case ActionKind.TOGGLE_MUTE:
      return { ...state, muted: !state.muted }
    case ActionKind.SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload }
    case ActionKind.SET_DURATION:
      return { ...state, duration: action.payload }
    case ActionKind.CLEAR:
      return { playing: false, muted: state.muted, duration: 0, currentTime: 0, episode: null }
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  let [state, dispatch] = useReducer(audioReducer, {
    playing: false,
    muted: false,
    duration: 0,
    currentTime: 0,
    episode: null,
  })
  let playerRef = useRef<Howl | null>(null)
  let currentSrcRef = useRef<string | null>(null)
  let rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      playerRef.current?.unload()
      playerRef.current = null
      currentSrcRef.current = null
    }
  }, [])

  function stopRaf() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function startRaf() {
    stopRaf()
    let tick = () => {
      let howl = playerRef.current
      if (!howl) return
      let current = Number(howl.seek()) || 0
      dispatch({ type: ActionKind.SET_CURRENT_TIME, payload: Math.floor(current) })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  let actions = useMemo<PublicPlayerActions>(() => {
    return {
      play(episode) {
        if (episode) {
          dispatch({ type: ActionKind.SET_META, payload: episode })

          if (currentSrcRef.current !== episode.audio.src) {
            playerRef.current?.unload()
            playerRef.current = new Howl({
              src: [episode.audio.src],
              html5: true,
              volume: 1,
              preload: true,
              onplay: () => {
                dispatch({ type: ActionKind.PLAY })
                startRaf()
              },
              onpause: () => {
                dispatch({ type: ActionKind.PAUSE })
                stopRaf()
              },
              onstop: () => {
                dispatch({ type: ActionKind.PAUSE })
                stopRaf()
              },
              onend: () => {
                dispatch({ type: ActionKind.PAUSE })
                stopRaf()
              },
              onload: () => {
                let duration = playerRef.current?.duration() ?? 0
                dispatch({ type: ActionKind.SET_DURATION, payload: Math.floor(duration) })
              },
            })
            currentSrcRef.current = episode.audio.src
          }
        }

        playerRef.current?.play()
      },
      pause() {
        playerRef.current?.pause()
      },
      toggle(episode) {
        this.isPlaying(episode) ? actions.pause() : actions.play(episode)
      },
      seekBy(amount) {
        if (playerRef.current) {
          let current = Number(playerRef.current.seek()) || 0
          let next = current + amount
          playerRef.current.seek(next)
          dispatch({ type: ActionKind.SET_CURRENT_TIME, payload: Math.floor(next) })
        }
      },
      seek(time) {
        if (playerRef.current) {
          playerRef.current.seek(time)
          dispatch({ type: ActionKind.SET_CURRENT_TIME, payload: Math.floor(time) })
        }
      },
      playbackRate(rate) {
        if (playerRef.current) {
          playerRef.current.rate(rate)
        }
      },
      toggleMute() {
        let next = !state.muted
        playerRef.current?.mute(next)
        dispatch({ type: ActionKind.TOGGLE_MUTE })
      },
      clear() {
        stopRaf()
        playerRef.current?.stop()
        playerRef.current?.unload()
        playerRef.current = null
        currentSrcRef.current = null
        dispatch({ type: ActionKind.CLEAR })
      },
      isPlaying(episode) {
        return episode
          ? state.playing && currentSrcRef.current === episode.audio.src
          : state.playing
      },
    }
  }, [state.playing, state.muted])

  let api = useMemo<PlayerAPI>(() => ({ ...state, ...actions }), [state, actions])

  return <AudioPlayerContext.Provider value={api}>{children}</AudioPlayerContext.Provider>
}

export function useAudioPlayer(episode?: PodcastEpisode) {
  let player = useContext(AudioPlayerContext)

  let playerEpisode = useMemo<PlayerEpisode | undefined>(() => {
    if (!episode?.audio?.src) return undefined
    return {
      id: episode.address,
      title: episode.title,
      showTitle: episode.showTitle,
      showAddress: episode.showAddress,
      audio: { src: episode.audio.src },
    }
  }, [episode])

  if (!playerEpisode) {
    return player!
  }

  return useMemo<PlayerAPI>(
    () => ({
      ...player!,
      play() {
        player!.play(playerEpisode)
      },
      toggle() {
        player!.toggle(playerEpisode)
      },
      get playing() {
        return playerEpisode ? player!.isPlaying(playerEpisode) : player!.playing
      },
    }),
    [player, playerEpisode],
  )
}
