'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, X } from 'lucide-react'
import Sheet from '@/components/Sheet'
import { routines, routineExerciseCount } from '@/lib/exerciseLibrary'

export default function ProgramsSheet({ open, onClose, days }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      headerless
      className="min-h-[80dvh]"
      footer={<Link href="/library" onClick={onClose} className="glass-pill glass-pill-light">Create new program</Link>}
    >
      <button type="button" onClick={onClose} className="glass-icon-button mt-3" aria-label="Close"><X size={18} /></button>
      <h2 className="mb-6 mt-5 text-4xl">Programs</h2>

      <p className="mb-2 px-1 text-base font-semibold text-amber-500">Current program</p>
      <div className="overflow-hidden rounded-[28px] border-2 border-amber-400 bg-white/70 shadow-sm">
        <button type="button" onClick={() => setExpanded(previous => !previous)} aria-expanded={expanded} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span>
            <span className="block text-xl font-bold">My program</span>
            <span className="text-[var(--n-600)]">{days.length} workouts per week</span>
          </span>
          <ChevronRight size={20} className={`text-[var(--n-600)] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="border-t border-[var(--hairline)]">
            {days.map(day => (
              <div key={day.id} className="glass-row flex items-center justify-between px-5 py-3">
                <span className="font-semibold">{day.name}</span>
                <span className="text-sm text-[var(--n-600)]">{day.exercises.length} exercises</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mb-2 mt-7 px-1 text-base font-semibold text-[var(--n-600)]">Routines to start from</p>
      <div className="glass-card overflow-hidden">
        {routines.map(routine => (
          <Link key={routine.id} href={`/library/routine/${routine.id}`} onClick={onClose} className="glass-row flex items-center justify-between px-5 py-3.5">
            <span className="min-w-0">
              <span className="block font-semibold">{routine.name}</span>
              <span className="text-sm text-[var(--n-600)]">{routine.sessions.length > 1 ? `${routine.sessions.length} workouts` : `${routineExerciseCount(routine)} exercises`} · {routine.bodyPart}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-[var(--n-600)]" />
          </Link>
        ))}
      </div>
    </Sheet>
  )
}
