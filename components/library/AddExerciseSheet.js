'use client'

import { useEffect, useState } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import Sheet from '@/components/Sheet'
import { exercises, bodyParts, movements, equipmentTypes, filterExercises, buildWorkoutExerciseEntry } from '@/lib/exerciseLibrary'

// The 1i flow: search the library first, only offer to create a custom exercise on a genuine miss.
// Custom exercises are tagged the same way but aren't written back into the shared library index yet.
export default function AddExerciseSheet({ open, onClose, dayName, onAdd }) {
  const [search, setSearch] = useState('')
  const [addedIds, setAddedIds] = useState(() => new Set())
  const [customTags, setCustomTags] = useState({ bodyPart: bodyParts[0], movement: movements[0], equipment: equipmentTypes[0] })

  useEffect(() => {
    if (open) { setSearch(''); setAddedIds(new Set()); setCustomTags({ bodyPart: bodyParts[0], movement: movements[0], equipment: equipmentTypes[0] }) }
  }, [open])

  const matches = search.trim() ? filterExercises(exercises, { search }).slice(0, 20) : []

  const handleAddExisting = exercise => {
    onAdd(buildWorkoutExerciseEntry(exercise, 3))
    setAddedIds(previous => new Set(previous).add(exercise.id))
  }

  const handleCreateCustom = () => {
    const name = search.trim()
    if (!name) return
    onAdd(buildWorkoutExerciseEntry({ id: null, name, ...customTags }, 3))
    setSearch('')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add an exercise">
      {dayName && <p className="mb-4 text-sm text-[var(--n-600)]">Adding to <strong className="font-bold text-[var(--ink)]">{dayName}</strong></p>}

      <div className="mb-4 flex items-center gap-2 border-2 border-[var(--accent)] px-3">
        <Search size={15} className="text-[var(--n-600)]" />
        <input
          type="text"
          autoFocus
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search exercises"
          className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {search && <button type="button" onClick={() => setSearch('')}><X size={14} className="text-[var(--n-600)]" /></button>}
      </div>

      {!search.trim() && <p className="py-2 text-sm text-[var(--n-600)]">Start typing to search the exercise library.</p>}

      {search.trim() && matches.length > 0 && (
        <>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">In the library · {matches.length} match{matches.length === 1 ? '' : 'es'}</p>
          <div className="mb-2 border-t-2 border-[var(--divider)]">
            {matches.map(exercise => {
              const added = addedIds.has(exercise.id)
              return (
                <div key={exercise.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--hairline)] py-3">
                  <div className="min-w-0">
                    <strong className="block text-sm font-bold">{exercise.name}</strong>
                    <span className="text-xs text-[var(--n-600)]">{exercise.bodyPart} · {exercise.movement} · {exercise.equipment}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddExisting(exercise)}
                    className={`flex min-h-11 items-center gap-1 border-2 px-3 text-xs font-bold tracking-wide ${added ? 'border-[var(--hairline)] text-[var(--n-600)]' : 'border-[var(--accent)] bg-[var(--accent)] text-white'}`}
                  >
                    {added ? <><Check size={13} />ADDED</> : <><Plus size={13} />ADD</>}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {search.trim() && matches.length === 0 && (
        <div className="mt-2">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Neither — add your own</p>
          <div className="mb-4 flex min-h-12 items-center border-2 border-[var(--divider)] bg-[var(--surface)] px-3">
            <span className="text-sm font-bold">{search.trim()}</span>
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Body part</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {bodyParts.map(value => <button key={value} type="button" onClick={() => setCustomTags(previous => ({ ...previous, bodyPart: value }))} className={`min-h-9 border-2 px-3 text-xs font-bold ${customTags.bodyPart === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--hairline)]'}`}>{value}</button>)}
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Movement</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {movements.map(value => <button key={value} type="button" onClick={() => setCustomTags(previous => ({ ...previous, movement: value }))} className={`min-h-9 border-2 px-3 text-xs font-bold ${customTags.movement === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--hairline)]'}`}>{value}</button>)}
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Equipment</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {equipmentTypes.map(value => <button key={value} type="button" onClick={() => setCustomTags(previous => ({ ...previous, equipment: value }))} className={`min-h-9 border-2 px-3 text-xs font-bold ${customTags.equipment === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--hairline)]'}`}>{value}</button>)}
          </div>
          <button type="button" onClick={handleCreateCustom} className="min-h-11 w-full bg-[var(--accent)] text-sm font-bold text-white">CREATE AND ADD</button>
          <p className="mt-2 text-xs text-[var(--n-600)]">Added to this day only — it isn&apos;t saved to the shared library yet.</p>
        </div>
      )}

      <button type="button" onClick={onClose} className="mt-5 min-h-11 w-full border-2 border-[var(--divider)] text-sm font-bold">DONE</button>
    </Sheet>
  )
}
