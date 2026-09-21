'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { routineExerciseCount } from '@/lib/exerciseLibrary'

export default function RoutineRow({ routine, onAdd }) {
  const isMultiSession = routine.sessions.length > 1
  const exerciseCount = routineExerciseCount(routine)
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b-2 border-[var(--divider)] py-3">
      <div className="min-w-0">
        <strong className="block text-[16px] font-bold text-[var(--ink)]">{routine.name}</strong>
        <span className="text-xs text-[var(--n-600)]">{exerciseCount} exercises · {routine.bodyPart} · {isMultiSession ? <strong className="font-bold text-[var(--accent-700)]">{routine.sessions.length} sessions</strong> : '1 session'}</span>
      </div>
      <Link href={`/library/routine/${routine.id}`} className="flex min-h-11 items-center border-2 border-[var(--divider)] px-3 text-xs font-bold tracking-wide">REVIEW</Link>
      {!isMultiSession && (
        <button type="button" onClick={() => onAdd(routine)} className="flex min-h-11 items-center gap-1 border-2 border-[var(--accent)] bg-[var(--accent)] px-3 text-xs font-bold tracking-wide text-white">
          <Plus size={13} />ADD
        </button>
      )}
    </div>
  )
}
