'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Plus, Search } from 'lucide-react'
import Sheet from '@/components/Sheet'
import AddExerciseSheet from '@/components/library/AddExerciseSheet'
import { bodyParts, equipmentTypes, exercises, filterExercises, getReplacements, resolveLibraryExercise } from '@/lib/exerciseLibrary'
import { getPreferredKeys } from '@/lib/exerciseSettings'

const FilterSelect = ({ value, onChange, allLabel, options }) => (
  <label className="glass-chip relative flex shrink-0 items-center gap-1 !min-h-10 pr-8">
    <select value={value} onChange={event => onChange(event.target.value)} className="appearance-none bg-transparent pr-1 text-sm font-bold outline-none">
      <option value="">{allLabel}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
    <ChevronDown size={15} className="pointer-events-none absolute right-3" />
  </label>
)

export default function SwapExerciseSheet({ open, onClose, exercise, dayName, onSwap }) {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('')
  const [equipment, setEquipment] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [preferredKeys, setPreferredKeys] = useState(new Set())

  useEffect(() => {
    if (!open) return
    setSearch(''); setMuscle(''); setEquipment(''); setSelectedId(null)
    setPreferredKeys(getPreferredKeys())
  }, [open])

  const current = useMemo(() => resolveLibraryExercise(exercise) || exercise, [exercise])
  const isFiltering = Boolean(search.trim() || muscle || equipment)

  const rows = useMemo(() => {
    if (!open) return []
    if (!isFiltering) {
      return getReplacements(exercise, { preferredKeys }).map(item => ({ exercise: item.exercise, essential: item.essential }))
    }
    const filters = { bodyPart: muscle ? [muscle] : [], movement: [], equipment: equipment ? [equipment] : [] }
    return filterExercises(exercises, { search, filters })
      .filter(candidate => candidate.id !== current?.id)
      .slice(0, 60)
      .map(candidate => ({ exercise: candidate, essential: false }))
  }, [open, exercise, current, isFiltering, search, muscle, equipment, preferredKeys])

  const confirm = () => {
    const chosen = rows.find(row => row.exercise.id === selectedId)?.exercise
    if (!chosen) return
    onSwap(chosen)
    onClose()
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Switch exercise"
        className="min-h-[85dvh]"
        leading={<button type="button" onClick={onClose} className="glass-icon-button shrink-0" aria-label="Close"><span aria-hidden="true" className="text-xl leading-none">×</span></button>}
        trailing={<button type="button" onClick={() => setAddOpen(true)} className="glass-icon-button shrink-0" aria-label="Add custom exercise"><Plus size={18} /></button>}
        footer={selectedId ? <button type="button" onClick={confirm} className="glass-pill">Swap exercise</button> : null}
      >
        <label className="glass-card flex items-center gap-3 px-4 py-3">
          <Search size={18} className="shrink-0 text-[var(--n-600)]" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search exercise" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
        </label>
        <div className="mt-3 flex gap-2">
          <FilterSelect value={muscle} onChange={setMuscle} allLabel="All Muscles" options={bodyParts} />
          <FilterSelect value={equipment} onChange={setEquipment} allLabel="All Equipment" options={equipmentTypes} />
        </div>

        <div className="mx-auto mt-5 w-[62%] max-w-52 rounded-[26px] border border-white/80 bg-white/60 p-4 text-center shadow-sm">
          <span className="inline-block rounded-full bg-black/[0.07] px-3 py-1 text-xs font-bold">Current</span>
          <p className="mt-6 text-lg font-bold leading-tight">{exercise?.name}</p>
          <p className="mb-2 mt-1 text-sm text-[var(--n-600)]">{current?.bodyPart || current?.equipment || ' '}</p>
        </div>

        <p className="mb-2 mt-6 px-2 text-sm font-semibold text-[var(--n-600)]">{isFiltering ? 'Results' : 'Best replacements'}</p>
        {rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-[var(--n-600)]">No matching exercises. Try different filters or add a custom one with +.</p>
        ) : (
          <div className="glass-card overflow-hidden" role="radiogroup" aria-label="Replacement exercises">
            {rows.map(({ exercise: candidate, essential }) => {
              const selected = candidate.id === selectedId
              return (
                <button key={candidate.id} type="button" role="radio" aria-checked={selected} onClick={() => setSelectedId(candidate.id)} className={`glass-row flex w-full items-center gap-3 px-4 py-3.5 text-left ${selected ? 'bg-[var(--accent-100)]' : ''}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold leading-tight">{candidate.name}</span>
                    <span className="block text-sm text-[var(--n-600)]">{candidate.equipment}{isFiltering && candidate.bodyPart ? ` · ${candidate.bodyPart}` : ''}</span>
                  </span>
                  {essential && <span className="shrink-0 rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-700">Essential</span>}
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-[var(--accent)]' : 'border-[var(--n-500)]'}`}>
                    {selected && <span className="h-3.5 w-3.5 rounded-full bg-[var(--accent)]" />}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </Sheet>
      <AddExerciseSheet open={addOpen} onClose={() => setAddOpen(false)} dayName={dayName} onAdd={entry => { setAddOpen(false); onSwap(entry); onClose() }} />
    </>
  )
}
