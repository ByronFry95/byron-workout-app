'use client'

import { useEffect, useMemo, useState } from 'react'
import Sheet from '@/components/Sheet'
import { bodyParts, movements, equipmentTypes, exercises, filterExercises } from '@/lib/exerciseLibrary'

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-9 border-2 px-3 text-xs font-bold ${active ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--hairline)] text-[var(--ink)]'}`}
  >
    {children}
  </button>
)

const toggle = (list, value) => list.includes(value) ? list.filter(item => item !== value) : [...list, value]

export default function LibraryFilterSheet({ open, onClose, filters, search = '', onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => { if (open) setDraft(filters) }, [open, filters])

  // Reflects the chips as they're toggled, before Show is pressed.
  const resultCount = useMemo(() => filterExercises(exercises, { search, filters: draft }).length, [search, draft])

  const clear = () => setDraft({ bodyPart: [], movement: [], equipment: [] })
  const apply = () => { onApply(draft); onClose() }

  return (
    <Sheet open={open} onClose={onClose} title="Filter exercises">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Body part</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {bodyParts.map(value => <Chip key={value} active={draft.bodyPart.includes(value)} onClick={() => setDraft(previous => ({ ...previous, bodyPart: toggle(previous.bodyPart, value) }))}>{value}</Chip>)}
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Movement</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {movements.map(value => <Chip key={value} active={draft.movement.includes(value)} onClick={() => setDraft(previous => ({ ...previous, movement: toggle(previous.movement, value) }))}>{value}</Chip>)}
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Equipment</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {equipmentTypes.map(value => <Chip key={value} active={draft.equipment.includes(value)} onClick={() => setDraft(previous => ({ ...previous, equipment: toggle(previous.equipment, value) }))}>{value}</Chip>)}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <button type="button" onClick={clear} className="min-h-12 border-2 border-[var(--divider)] px-4 text-xs font-bold uppercase tracking-[0.08em]">Clear</button>
        <button type="button" onClick={apply} className="min-h-12 bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Show {resultCount} exercises</button>
      </div>
    </Sheet>
  )
}
