'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Search, X } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, addExercisesToDay, createWorkoutDay } from '@/lib/firebaseQueries'
import { exercises, routines, filterExercises, buildWorkoutExerciseEntry } from '@/lib/exerciseLibrary'
import AppNav from '@/components/AppNav'
import Segmented from '@/components/Segmented'
import ExerciseRow from '@/components/library/ExerciseRow'
import RoutineRow from '@/components/library/RoutineRow'
import LibraryFilterSheet from '@/components/library/LibraryFilterSheet'
import AddToSessionSheet from '@/components/library/AddToSessionSheet'
import AddedToast from '@/components/library/AddedToast'

const emptyFilters = { bodyPart: [], movement: [], equipment: [] }

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth()
  const { session: liveSession } = useWorkoutSession()
  const router = useRouter()

  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [tab, setTab] = useState('exercises')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const [addSheet, setAddSheet] = useState({ open: false, type: null, item: null })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    getWorkoutDays(user.uid).then(setDays).catch(error => setLoadError(error?.code || error?.message || 'Unable to load workout days.')).finally(() => setLoading(false))
  }, [user, authLoading, router])

  const activeFilterCount = filters.bodyPart.length + filters.movement.length + filters.equipment.length

  const filteredExercises = useMemo(() => filterExercises(exercises, { search, filters }), [search, filters])

  const filteredRoutines = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return routines
    return routines.filter(routine => routine.name.toLowerCase().includes(term))
  }, [search])

  const findDayForLibraryId = libraryId => days.find(day => (day.exercises || []).some(exercise => exercise.libraryId === libraryId))

  const handleAddExerciseClick = exercise => setAddSheet({ open: true, type: 'exercise', item: exercise })
  const handleAddRoutineClick = routine => setAddSheet({ open: true, type: 'routine', item: routine })

  const handleConfirmAdd = async ({ dayId, startingSets }) => {
    if (!user) return
    const { type, item } = addSheet

    if (type === 'exercise') {
      const entry = buildWorkoutExerciseEntry(item, startingSets)
      if (dayId) {
        const updatedDays = await addExercisesToDay(user.uid, dayId, [entry])
        applyDaysLocalOnly(updatedDays, days.find(day => day.id === dayId)?.name)
      } else {
        const updatedDays = await createWorkoutDay(user.uid, 'New Day', [entry])
        applyDaysLocalOnly(updatedDays, 'New Day')
      }
      return
    }

    // Single-session routine: add every exercise in its one session.
    const routineEntries = item.sessions[0].exercises.map(({ id, sets }) => buildWorkoutExerciseEntry(exercises.find(exercise => exercise.id === id), sets))
    if (dayId) {
      const updatedDays = await addExercisesToDay(user.uid, dayId, routineEntries)
      applyDaysLocalOnly(updatedDays, days.find(day => day.id === dayId)?.name)
    } else {
      const updatedDays = await createWorkoutDay(user.uid, item.name, routineEntries)
      applyDaysLocalOnly(updatedDays, item.name)
    }
  }

  // Firestore write already happened above (helpers write internally); mirror it locally + arm undo.
  const applyDaysLocalOnly = (updatedDays, dayName) => {
    const previousDays = days
    setDays(updatedDays)
    setToast({ dayName: dayName || 'day', undo: async () => { setDays(previousDays); await saveWorkoutDays(user.uid, previousDays) } })
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading library...</div>
  if (!user) return null

  return (
    <>
      <AppNav />
      <main>
        <h1 className="mb-6 text-3xl text-[var(--ink)]">Exercise Library</h1>
        {loadError && <p className="mb-4 text-sm text-[var(--accent-700)]">{loadError}</p>}

        <div className="mb-3 flex gap-2">
          <div className="flex min-h-11 flex-1 items-center gap-2 border-2 border-[var(--hairline)] px-3">
            <Search size={15} className="text-[var(--n-600)]" />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={tab === 'exercises' ? 'Search exercises' : 'Search routines'}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {search && <button type="button" onClick={() => setSearch('')}><X size={14} className="text-[var(--n-600)]" /></button>}
          </div>
          {tab === 'exercises' && (
            <button type="button" onClick={() => setFilterSheetOpen(true)} className="flex min-h-11 items-center gap-2 border-2 border-[var(--divider)] bg-[var(--surface)] px-3 text-xs font-bold tracking-wide">
              <Filter size={15} />FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          )}
        </div>

        <div className="mb-4">
          <Segmented options={[{ value: 'exercises', label: 'Exercises' }, { value: 'routines', label: 'Routines' }]} value={tab} onChange={setTab} />
        </div>

        {tab === 'exercises' ? (
          filteredExercises.length === 0 ? (
            <div className="border-y border-[var(--hairline)] py-6"><p className="font-bold">No exercises match</p><p className="mt-1 text-sm text-[var(--n-600)]">Try clearing your filters or search.</p></div>
          ) : (
            <div className="border-t-2 border-[var(--divider)]">
              {filteredExercises.map(exercise => <ExerciseRow key={exercise.id} exercise={exercise} addedDayName={findDayForLibraryId(exercise.id)?.name} onAdd={handleAddExerciseClick} />)}
            </div>
          )
        ) : (
          filteredRoutines.length === 0 ? (
            <div className="border-y border-[var(--hairline)] py-6"><p className="font-bold">No routines match</p><p className="mt-1 text-sm text-[var(--n-600)]">Try a different search.</p></div>
          ) : (
            <div className="border-t-2 border-[var(--divider)]">
              {filteredRoutines.map(routine => <RoutineRow key={routine.id} routine={routine} onAdd={handleAddRoutineClick} />)}
            </div>
          )
        )}
      </main>

      <LibraryFilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} filters={filters} search={search} onApply={setFilters} />

      <AddToSessionSheet
        open={addSheet.open}
        onClose={() => setAddSheet({ open: false, type: null, item: null })}
        subtitle={addSheet.type === 'exercise' ? `${addSheet.item?.name} · 3 sets` : addSheet.item ? `${addSheet.item.sessions[0].exercises.length} exercises` : ''}
        days={days}
        liveSession={liveSession?.startedAt ? liveSession : null}
        showStartingSets={addSheet.type === 'exercise'}
        onConfirm={handleConfirmAdd}
      />

      {toast && <AddedToast dayName={toast.dayName} onUndo={async () => { await toast.undo(); setToast(null) }} />}
    </>
  )
}
