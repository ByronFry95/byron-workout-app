'use client'

import { useEffect, useState } from 'react'

const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function WorkoutTimer({ session, onStartDay, onEndDay, sticky = false, showEndButton = true }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!session?.startedAt || session?.endedAt) {
      setElapsedMs(session?.durationMs || 0)
      return
    }

    const tick = () => {
      const startedAt = new Date(session.startedAt).getTime()
      setElapsedMs(Date.now() - startedAt)
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [session])

  const isRunning = Boolean(session?.startedAt && !session?.endedAt)

  useEffect(() => {
    if (!isRunning || !('wakeLock' in navigator)) return undefined

    let wakeLock
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch (error) {
        console.warn('Screen wake lock unavailable:', error)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }

    requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLock?.release()
    }
  }, [isRunning])

  return (
    <div className={`bg-ink p-4 text-white ${sticky ? 'sticky top-0 z-30 mb-0 border-b-2 border-[var(--accent)]' : `mb-6 ${isRunning ? 'fixed bottom-[4.75rem] left-3 right-3 z-30 mb-0 sm:static sm:mb-6' : ''}`}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] text-slate-300">Workout Timer</span>
        <span className={`px-2.5 py-1 text-[0.72rem] font-bold ${isRunning ? 'bg-[var(--accent)] text-white' : 'bg-white/10 text-slate-200'}`}>
          {isRunning ? 'In Progress' : 'Ready'}
        </span>
      </div>

      <div className="num my-2 text-3xl tracking-[0.06em] sm:text-5xl">
        {formatDuration(elapsedMs)}
      </div>

      <div className="flex justify-end">
        {isRunning && showEndButton && (
          <button className="min-h-11 bg-[var(--accent)] px-4 py-2.5 font-bold text-white transition-transform duration-200 hover:-translate-y-0.5" onClick={onEndDay}>
            End Day
          </button>
        )}
      </div>
    </div>
  )
}
