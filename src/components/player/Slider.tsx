import { useRef } from 'react'
import { mergeProps, useFocusRing, useSlider, useSliderThumb, VisuallyHidden } from 'react-aria'
import { type SliderState, type SliderStateOptions, useSliderState } from 'react-stately'
import clsx from 'clsx'

function parseTime(seconds: number) {
  let hours = Math.floor(seconds / 3600)
  let minutes = Math.floor((seconds - hours * 3600) / 60)
  seconds = seconds - hours * 3600 - minutes * 60
  return [hours, minutes, seconds]
}

function formatTime(seconds: Array<number>, totalSeconds = seconds) {
  let totalWithoutLeadingZeroes = totalSeconds.slice(totalSeconds.findIndex((x) => x !== 0))
  return seconds
    .slice(seconds.length - totalWithoutLeadingZeroes.length)
    .map((x) => x.toString().padStart(2, '0'))
    .join(':')
}

function Thumb(props: {
  index: number
  state: SliderState
  trackRef: React.RefObject<React.ElementRef<'div'> | null>
  isFocusVisible: boolean
  focusProps: ReturnType<typeof useFocusRing>['focusProps']
  onChangeStart?: () => void
}) {
  let { state, trackRef, focusProps, isFocusVisible, index } = props
  let inputRef = useRef<React.ElementRef<'input'>>(null)
  let { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state)

  return (
    <div
      className="absolute bottom-1.25 -translate-x-1/2"
      style={{
        left: `${state.getThumbPercent(index) * 100}%`,
      }}
    >
      <div
        {...thumbProps}
        onMouseDown={(...args) => {
          thumbProps.onMouseDown?.(...args)
          props.onChangeStart?.()
        }}
        onPointerDown={(...args) => {
          thumbProps.onPointerDown?.(...args)
          props.onChangeStart?.()
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full"
      >
        <div
          className={clsx(
            'h-2.5 rounded-t-full',
            isFocusVisible || state.isThumbDragging(index)
              ? 'w-1.5 bg-zinc-900 dark:bg-zinc-500'
              : 'w-1 bg-zinc-700 dark:bg-zinc-500',
          )}
        />
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
        </VisuallyHidden>
      </div>
    </div>
  )
}

export function Slider(
  props: SliderStateOptions<Array<number>> & { onChangeStart?: () => void; showOutput?: boolean },
) {
  let trackRef = useRef<React.ElementRef<'div'>>(null)
  let state = useSliderState(props)
  let { groupProps, trackProps, labelProps, outputProps } = useSlider(props, state, trackRef)
  let { focusProps, isFocusVisible } = useFocusRing()
  let showOutput = props.showOutput ?? true

  let currentTime = parseTime(state.getThumbValue(0))
  let totalTime = parseTime(state.getThumbMaxValue(0))

  return (
    <div {...groupProps} className="relative flex w-full min-w-0 touch-none items-center gap-6 hover:cursor-pointer">
      {props.label && (
        <label className="sr-only" {...labelProps}>
          {props.label}
        </label>
      )}
      <div
        {...trackProps}
        onMouseDown={(e) => {
          trackProps.onMouseDown?.(e)
          props.onChangeStart?.()
        }}
        onPointerDown={(e) => {
          trackProps.onPointerDown?.(e)
          props.onChangeStart?.()
        }}
        onClick={(e) => {
          if (!trackRef.current) return
          const rect = trackRef.current.getBoundingClientRect()
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          const value = percent * (state.getThumbMaxValue(0) - state.getThumbMinValue(0)) + state.getThumbMinValue(0)
          state.setThumbValue(0, value)
          props.onChangeStart?.()
        }}
        ref={trackRef}
        className="relative h-2 w-full flex-1 overflow-visible"
      >
        {/* Invisible hit area extending below */}
        <div
          className="absolute inset-x-0 -bottom-1 h-1"
          onClick={(e) => {
            e.stopPropagation()
            if (!trackRef.current) return
            const rect = trackRef.current.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            const value = percent * (state.getThumbMaxValue(0) - state.getThumbMinValue(0)) + state.getThumbMinValue(0)
            state.setThumbValue(0, value)
            props.onChangeStart?.()
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-b-md" />
        <div
          className={clsx(
            'pointer-events-none absolute left-0 bottom-0 h-1 sm:rounded-l-xl sm:rounded-r-md',
            isFocusVisible || state.isThumbDragging(0) ? 'bg-zinc-900 dark:bg-zinc-400' : 'bg-zinc-400 dark:bg-zinc-400',
          )}
          style={{
            width:
              state.getThumbValue(0) === 0
                ? 0
                : `calc(${state.getThumbPercent(0) * 100}% - ${
                    isFocusVisible || state.isThumbDragging(0) ? '0.3125rem' : '0.25rem'
                  })`,
          }}
        />
        <Thumb
          index={0}
          state={state}
          trackRef={trackRef}
          onChangeStart={props.onChangeStart}
          focusProps={focusProps}
          isFocusVisible={isFocusVisible}
        />
      </div>
      {showOutput ? (
        <div className="hidden items-center gap-2 sm:flex">
          <output
            {...outputProps}
            aria-live="off"
            className={clsx(
              'hidden rounded-md px-1 font-mono text-sm/6 sm:block',
              state.getThumbMaxValue(0) === 0 && 'opacity-0',
              isFocusVisible || state.isThumbDragging(0)
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {/*{formatTime(currentTime, totalTime)}*/}
          </output>
          {/*<span className="text-sm/6 text-zinc-300 dark:text-zinc-600" aria-hidden="true">
            /
          </span>*/}
          {/*<span
            className={clsx(
              'hidden rounded-md px-1 py-0.5 font-mono text-sm/6 text-zinc-500 dark:text-zinc-400 sm:block',
              state.getThumbMaxValue(0) === 0 && 'opacity-0',
            )}
          >
            {formatTime(totalTime)}
          </span>*/}
        </div>
      ) : null}
    </div>
  )
}
