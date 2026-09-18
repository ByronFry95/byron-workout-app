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

export default function WorkoutTimer({ session, onStartDay, onEndDay }) {
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

  return (
    <div className="bg-dark-blue mb-6 rounded-2xl p-5 text-white shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] text-slate-300">Workout Timer</span>
        <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${isRunning ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-slate-200'}`}>
          {isRunning ? 'In Progress' : 'Ready'}
        </span>
      </div>

      <div className="my-2 text-4xl font-bold tracking-[0.06em] tabular-nums sm:text-5xl">
        {formatDuration(elapsedMs)}
      </div>

      <div className="flex justify-end">
        {isRunning && (
          <button className="rounded-xl bg-amber-400 px-4 py-2.5 font-bold text-slate-900 transition-transform duration-200 hover:-translate-y-0.5" onClick={onEndDay}>
            End Day
          </button>
        )}
      </div>
    </div>
  )
}
