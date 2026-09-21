'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Sheet from '@/components/Sheet'

// Shared destination for every "add to a workout" flow in the library — a single exercise,
// a routine's checked exercises, or one routine session all resolve to picking a day here.
export default function AddToSessionSheet({ open, onClose, subtitle, days, liveSession, showStartingSets = false, confirmLabel, onConfirm }) {
  const [selectedDayId, setSelectedDayId] = useState(null)
  const [startingSets, setStartingSets] = useState(3)

  useEffect(() => {
    if (!open) return
    setSelectedDayId(liveSession?.dayId ?? days[0]?.id ?? 'new')
    setStartingSets(3)
  }, [open, liveSession, days])

  const selectedDay = days.find(day => day.id === selectedDayId)
  const label = confirmLabel ? confirmLabel(selectedDay) : selectedDay ? `ADD TO ${selectedDay.name.toUpperCase()}` : 'ADD TO NEW DAY'

  const handleConfirm = () => {
    onConfirm({ dayId: selectedDayId === 'new' ? null : selectedDayId, startingSets })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add to a session">
      {subtitle && <p className="mb-4 text-sm text-[var(--n-600)]">{subtitle}</p>}

      {liveSession && (
        <>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">Session in progress</p>
          <button
            type="button"
            onClick={() => setSelectedDayId(liveSession.dayId)}
            className={`mb-4 grid w-full grid-cols-[20px_1fr_auto] items-center gap-3 border-2 px-3 py-3 text-left ${selectedDayId === liveSession.dayId ? 'border-[var(--accent)] bg-[var(--accent-100)]' : 'border-[var(--divider)]'}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center border-2 ${selectedDayId === liveSession.dayId ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--divider)]'}`}>
              {selectedDayId === liveSession.dayId && <span className="h-2 w-2 bg-white" />}
            </span>
            <span>
              <strong className="block text-sm font-bold">{days.find(day => day.id === liveSession.dayId)?.name || 'Active day'}</strong>
              <span className="text-xs text-[var(--accent-700)]">In progress</span>
            </span>
          </button>
        </>
      )}

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Your days</p>
      <div className="mb-2 border-t-2 border-[var(--divider)]">
        {days.map(day => (
          <button
            key={day.id}
            type="button"
            onClick={() => setSelectedDayId(day.id)}
            className="grid min-h-14 w-full grid-cols-[20px_1fr_auto] items-center gap-3 border-b border-[var(--hairline)] text-left"
          >
            <span className={`flex h-5 w-5 items-center justify-center border-2 ${selectedDayId === day.id ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--divider)]'}`}>
              {selectedDayId === day.id && <span className="h-2 w-2 bg-white" />}
            </span>
            <strong className="text-sm font-bold">{day.name}</strong>
            <span className="num text-xs text-[var(--n-600)]">{day.exercises?.length || 0} ex</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelectedDayId('new')}
          className="grid min-h-14 w-full grid-cols-[20px_1fr] items-center gap-3 border-b-2 border-[var(--divider)] text-left"
        >
          <span className={`flex h-5 w-5 items-center justify-center border-2 border-dashed ${selectedDayId === 'new' ? 'border-[var(--accent)] bg-[var(--accent-100)]' : 'border-[var(--divider)]'}`}>
            <Plus size={12} />
          </span>
          <strong className="text-sm font-bold">New day</strong>
        </button>
      </div>

      {showStartingSets && (
        <div className="flex items-center justify-between border-b-2 border-[var(--divider)] py-4">
          <span className="text-sm font-bold">Starting sets</span>
          <div className="flex items-center border-2 border-[var(--divider)]">
            <button type="button" onClick={() => setStartingSets(previous => Math.max(1, previous - 1))} className="flex h-10 w-10 items-center justify-center"><Minus size={15} /></button>
            <span className="num flex h-10 w-10 items-center justify-center border-x-2 border-[var(--divider)] text-sm">{startingSets}</span>
            <button type="button" onClick={() => setStartingSets(previous => previous + 1)} className="flex h-10 w-10 items-center justify-center"><Plus size={15} /></button>
          </div>
        </div>
      )}

      <button type="button" onClick={handleConfirm} className="mt-5 min-h-11 w-full bg-[var(--accent)] px-4 text-sm font-bold text-white">{label}</button>
    </Sheet>
  )
}
