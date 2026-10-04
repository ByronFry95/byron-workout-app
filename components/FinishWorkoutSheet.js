'use client'

import { useEffect, useState } from 'react'
import { Clock, Dumbbell, Flame, Layers } from 'lucide-react'
import Sheet from './Sheet'
import { cardioDerived, formatCardioSummary } from '@/lib/cardio'

const formatDuration = ms => {
  const minutes = Math.max(0, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const formatClock = value => new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const formatVolume = value => value >= 10000 ? `${(value / 1000).toFixed(1)}t` : `${Math.round(value).toLocaleString('en-GB')} kg`

export default function FinishWorkoutSheet({ open, onClose, onFinish, summary, startedAt, finishing }) {
  const [notes, setNotes] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (open) setNow(Date.now())
  }, [open])

  if (!summary) return null
  const maxVolume = summary.muscles[0]?.volume || 0
  const maxSets = Math.max(1, ...summary.muscles.map(item => item.sets))

  return (
    <Sheet open={open} onClose={onClose} title="Finish workout?">
      <div className="pb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: 'Time', value: formatDuration(now - startedAt) },
            { icon: Dumbbell, label: 'Volume', value: formatVolume(summary.totalVolume) },
            { icon: Layers, label: 'Sets', value: String(summary.setsLogged) },
          ].map(item => (
            <div key={item.label} className="glass-card flex flex-col items-center gap-1 px-2 py-3 text-center">
              <item.icon size={16} className="text-[var(--accent)]" aria-hidden="true" />
              <span className="num text-lg leading-none">{item.value}</span>
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--n-600)]">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-[var(--n-600)]">
          <span>{formatClock(startedAt)} → {formatClock(now)}</span>
          {summary.topMuscle && <span className="flex items-center gap-1.5 font-semibold text-[var(--ink)]"><Flame size={15} className="text-[var(--accent)]" aria-hidden="true" />Most worked: {summary.topMuscle}</span>}
        </div>

        {summary.cardio ? (
          <div className="glass-card mt-4 rounded-2xl px-4 py-3">
            <p className="text-sm font-bold">{summary.cardio.activityName}</p>
            <p className="mt-1 text-sm text-[var(--n-600)]">{formatCardioSummary(summary.cardio)}{cardioDerived(summary.cardio).map(item => ` · ${item.value}`).join('')}</p>
          </div>
        ) : summary.muscles.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--n-600)]">Volume by muscle group</p>
            <div className="flex flex-col gap-2.5">
              {summary.muscles.map(item => (
                <div key={item.muscle}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{item.muscle}</span><span className="num text-[var(--n-600)]">{formatVolume(item.volume)} · {item.sets} {item.sets === 1 ? 'set' : 'sets'}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[var(--accent)]" style={{ width: `${Math.max(4, (item.volume / maxVolume) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-sm text-[var(--n-600)]">No sets have been logged yet.</p>
        )}

        <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} placeholder="Workout notes" className="mt-4 w-full rounded-2xl border border-[var(--hairline)] bg-white/70 p-3 text-base outline-none" />

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="glass-pill-light h-12 flex-1 text-sm font-bold">Keep going</button>
          <button type="button" disabled={finishing} onClick={() => onFinish(notes.trim())} className="glass-pill h-12 flex-[2] text-sm disabled:opacity-60">{finishing ? 'Saving...' : 'FINISH'}</button>
        </div>
      </div>
    </Sheet>
  )
}
