'use client'

import { useEffect, useMemo, useState } from 'react'
import './WorkoutTimer.css'

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
    <div className="workout-timer">
      <div className="timer-header">
        <span className="timer-label">Workout Timer</span>
        <span className={`timer-status ${isRunning ? 'running' : ''}`}>
          {isRunning ? 'In Progress' : 'Ready'}
        </span>
      </div>

      <div className="timer-display">{formatDuration(elapsedMs)}</div>

      <div className="timer-actions">
        {!isRunning ? (
          <button className="start-day-btn" onClick={onStartDay}>
            Start Day
          </button>
        ) : (
          <button className="end-day-btn" onClick={onEndDay}>
            End Day
          </button>
        )}
      </div>
    </div>
  )
}
