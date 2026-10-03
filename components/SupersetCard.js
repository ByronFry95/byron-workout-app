'use client'

import { useState } from 'react'
import { Link2, Play, Square, Unlink } from 'lucide-react'

const BADGES = [
  { label: 'A', className: 'bg-[var(--accent)]' },
  { label: 'B', className: 'bg-violet-500' },
  { label: 'C', className: 'bg-sky-500' },
  { label: 'D', className: 'bg-emerald-500' },
]

export default function SupersetCard({ group, sessionMode, onStartAll, onFinishAll, onUnlink, renderExercise }) {
  const [activeId, setActiveId] = useState(group[0].id)
  const currentActive = group.some(exercise => exercise.id === activeId) ? activeId : group[0].id
  const anyStarted = group.some(exercise => exercise.isStarted)

  const advance = loggedId => {
    const index = group.findIndex(exercise => exercise.id === loggedId)
    if (index < 0) return
    setActiveId(group[(index + 1) % group.length].id)
  }

  return (
    <div data-exercise-card className="superset-card rounded-[1.75rem] border border-violet-300/60 bg-violet-500/5 p-3 shadow-[0_8px_24px_rgba(139,92,246,0.10)]">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Link2 size={16} className="text-violet-600" aria-hidden="true" />
        <span className="flex-1 text-xs font-bold uppercase tracking-[0.12em] text-violet-700">Superset</span>
        {onUnlink && (
          <button type="button" onClick={() => onUnlink(group)} className="flex h-9 items-center gap-1 rounded-full border-0 bg-white/70 px-3 text-xs font-bold text-violet-700 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.35)]"><Unlink size={13} />Unlink</button>
        )}
        {sessionMode && !anyStarted && (
          <button type="button" onClick={() => onStartAll(group)} className="flex h-9 items-center gap-1 rounded-full border-0 bg-[var(--ink)] px-3.5 text-xs font-bold text-white"><Play size={13} />Start</button>
        )}
        {sessionMode && anyStarted && (
          <button type="button" onClick={() => onFinishAll(group)} className="flex h-9 items-center gap-1 rounded-full border-0 bg-[var(--accent)] px-3.5 text-xs font-bold text-white"><Square size={12} />Finish both</button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {group.map((exercise, index) => renderExercise(exercise, {
          embedded: true,
          badge: BADGES[index % BADGES.length],
          isExpanded: currentActive === exercise.id,
          isOtherExerciseExpanded: currentActive !== exercise.id,
          onExpand: setActiveId,
          onCollapse: () => {},
          onSetLogged: advance,
        }))}
      </div>
    </div>
  )
}
