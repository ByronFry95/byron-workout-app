'use client'

import Link from 'next/link'
import { Check, Plus } from 'lucide-react'

export default function ExerciseRow({ exercise, addedDayName, onAdd }) {
  const added = Boolean(addedDayName)
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b-2 border-[var(--divider)] py-3">
      <div className="min-w-0">
        <strong className={`block text-[15px] font-bold ${added ? 'text-[var(--n-600)]' : 'text-[var(--ink)]'}`}>{exercise.name}</strong>
        <span className="text-xs text-[var(--n-600)]">{added ? `In ${addedDayName}` : `${exercise.bodyPart} · ${exercise.movement} · ${exercise.equipment}`}</span>
      </div>
      <Link href={`/library/exercise/${exercise.id}`} className="flex min-h-11 items-center border-2 border-[var(--divider)] px-3 text-xs font-bold tracking-wide">DETAILS</Link>
      <button
        type="button"
        onClick={() => !added && onAdd(exercise)}
        disabled={added}
        className={`flex min-h-11 items-center gap-1 border-2 px-3 text-xs font-bold tracking-wide ${added ? 'border-[var(--hairline)] text-[var(--n-600)]' : 'border-[var(--accent)] bg-[var(--accent)] text-white'}`}
      >
        {added ? <><Check size={13} />ADDED</> : <><Plus size={13} />ADD</>}
      </button>
    </div>
  )
}
