'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronLeft, Plus } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, addExercisesToDay, createWorkoutDay } from '@/lib/firebaseQueries'
import { getRoutineById, getExerciseById, routineExerciseCount, buildWorkoutExerciseEntry } from '@/lib/exerciseLibrary'
import AddToSessionSheet from '@/components/library/AddToSessionSheet'
import AddedToast from '@/components/library/AddedToast'

export default function RoutineDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { session: liveSession } = useWorkoutSession()
  const router = useRouter()

  const routine = getRoutineById(id)
  const isMultiSession = routine ? routine.sessions.length > 1 : false

  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [sheetTarget, setSheetTarget] = useState(null) // { session } for multi, or 'single' for single-session
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    getWorkoutDays(user.uid).then(setDays).finally(() => setLoading(false))
  }, [user, authLoading, router])

  useEffect(() => {
    if (!routine || isMultiSession) return
    setSelected(new Set(routine.sessions[0].exercises.map(item => item.id)))
  }, [routine, isMultiSession])

  const singleSessionExercises = useMemo(() => routine && !isMultiSession ? routine.sessions[0].exercises.map(item => ({ ...item, exercise: getExerciseById(item.id) })) : [], [routine, isMultiSession])

  const findDayForLibraryId = libraryId => days.find(day => (day.exercises || []).some(entry => entry.libraryId === libraryId))

  const toggleSelected = exerciseId => setSelected(previous => {
    const next = new Set(previous)
    next.has(exerciseId) ? next.delete(exerciseId) : next.add(exerciseId)
    return next
  })

  const showToast = (dayName, previousDays) => setToast({ dayName, undo: async () => { setDays(previousDays); await saveWorkoutDays(user.uid, previousDays) } })

  const handleConfirmSingleSession = async ({ dayId, startingSets }) => {
    const previousDays = days
    const chosen = singleSessionExercises.filter(item => selected.has(item.id))
    const entries = chosen.map(item => buildWorkoutExerciseEntry(item.exercise, startingSets))
    if (dayId) {
      const updatedDays = await addExercisesToDay(user.uid, dayId, entries)
      setDays(updatedDays)
      showToast(updatedDays.find(day => day.id === dayId)?.name, previousDays)
    } else {
      const updatedDays = await createWorkoutDay(user.uid, routine.name, entries)
      setDays(updatedDays)
      showToast(routine.name, previousDays)
    }
  }

  const handleConfirmSessionGroup = async ({ dayId }) => {
    const previousDays = days
    const session = sheetTarget?.session
    if (!session) return
    const entries = session.exercises.map(({ id: exerciseId, sets }) => buildWorkoutExerciseEntry(getExerciseById(exerciseId), sets))
    if (dayId) {
      const updatedDays = await addExercisesToDay(user.uid, dayId, entries)
      setDays(updatedDays)
      showToast(updatedDays.find(day => day.id === dayId)?.name, previousDays)
    } else {
      const updatedDays = await createWorkoutDay(user.uid, session.name, entries)
      setDays(updatedDays)
      showToast(session.name, previousDays)
    }
  }

  const handleAddAllAsDays = async () => {
    const previousDays = days
    let latestDays = days
    for (const session of routine.sessions) {
      const entries = session.exercises.map(({ id: exerciseId, sets }) => buildWorkoutExerciseEntry(getExerciseById(exerciseId), sets))
      latestDays = await createWorkoutDay(user.uid, session.name, entries)
    }
    setDays(latestDays)
    showToast(`${routine.sessions.length} new days`, previousDays)
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading routine...</div>
  if (!user) return null
  if (!routine) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Routine not found. <Link href="/library" className="font-bold text-[var(--accent)]">Back to library</Link></div>

  const totalExercises = routineExerciseCount(routine)

  return (
    <>
      <div className="border-b-2 border-[var(--divider)] bg-[var(--surface)] px-5 py-3">
        <Link href="/library" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.09em]"><ChevronLeft size={16} />Library</Link>
      </div>
      <main className="pb-28">
        <h1 className="mb-2 text-3xl text-[var(--ink)]">{routine.name}</h1>
        <p className="mb-4 text-xs text-[var(--n-600)]">{totalExercises} exercises · {routine.bodyPart} · {isMultiSession ? `${routine.sessions.length} sessions` : '1 session'} · ~{routine.estMinutes} min{isMultiSession ? ' a session' : ''}</p>
        <p className="mb-5 text-sm leading-relaxed text-[var(--ink)]">{routine.tagline}</p>

        {isMultiSession && (
          <div className="mb-5 flex gap-3 border-2 border-[var(--accent)] bg-[var(--accent-100)] p-3 text-sm text-[var(--accent-700)]">
            This routine is <strong className="font-bold">{routine.sessions.length} separate sessions</strong>. Adding all of it creates {routine.sessions.length} new days in Workouts.
          </div>
        )}

        {!isMultiSession && (
          <div className="mb-1 flex items-center justify-between border-y-2 border-[var(--divider)] py-2">
            <span className="num text-xs">{selected.size} OF {singleSessionExercises.length} SELECTED</span>
            <button type="button" onClick={() => setSelected(new Set())} className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--n-600)]">Clear all</button>
          </div>
        )}

        {!isMultiSession ? (
          <div>
            {singleSessionExercises.map(({ id: exerciseId, sets, reps, exercise }) => (
              <button key={exerciseId} type="button" onClick={() => toggleSelected(exerciseId)} className="grid w-full grid-cols-[22px_1fr_auto] items-center gap-3 border-b border-[var(--hairline)] py-3 text-left">
                <span className={`flex h-5 w-5 items-center justify-center border-2 ${selected.has(exerciseId) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--divider)]'}`}>
                  {selected.has(exerciseId) && <Check size={13} className="text-white" />}
                </span>
                <span>
                  <strong className="block text-sm font-bold">{exercise?.name}</strong>
                  <span className="text-xs text-[var(--n-600)]">{findDayForLibraryId(exerciseId) ? `In ${findDayForLibraryId(exerciseId).name}` : `${exercise?.bodyPart} · ${exercise?.equipment}`}</span>
                </span>
                <span className="num text-xs text-[var(--n-600)]">{sets} × {reps}</span>
              </button>
            ))}
          </div>
        ) : (
          routine.sessions.map(session => (
            <div key={session.name} className="border-t-2 border-[var(--divider)] pt-2 pb-3">
              <div className="mb-1 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <strong className="block text-[15px] font-bold">{session.name}</strong>
                  <span className="text-xs text-[var(--n-600)]">{session.focusLabel}</span>
                </div>
                <span className="num text-xs text-[var(--n-600)]">{session.exercises.length} ex</span>
                <button type="button" onClick={() => setSheetTarget({ session })} className="flex min-h-11 items-center border-2 border-[var(--accent)] bg-[var(--accent)] px-3 text-xs font-bold text-white">ADD {session.exercises.length}</button>
              </div>
              {session.exercises.map(({ id: exerciseId, sets, reps }) => {
                const exercise = getExerciseById(exerciseId)
                return (
                  <div key={exerciseId} className="grid grid-cols-[18px_1fr_auto] items-center gap-2 border-t border-[var(--hairline)] py-2">
                    <span className="flex h-[18px] w-[18px] items-center justify-center border-2 border-[var(--accent)] bg-[var(--accent)]"><Check size={11} className="text-white" /></span>
                    <span className="text-sm font-bold">{exercise?.name}</span>
                    <span className="num text-xs text-[var(--n-600)]">{sets} × {reps}</span>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </main>

      <div className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-30 border-t-2 border-[var(--divider)] bg-[var(--surface)] px-5 py-3 sm:bottom-0">
        {isMultiSession ? (
          <>
            <button type="button" onClick={handleAddAllAsDays} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--accent)] text-sm font-bold text-white">
              <Plus size={15} />ADD {routine.sessions.length} DAYS · {totalExercises} EXERCISES
            </button>
            <p className="mt-2 text-xs text-[var(--n-600)]">Named {routine.sessions.map(session => session.name).join(', ')}. Rename or delete any of them afterwards.</p>
          </>
        ) : (
          <button type="button" disabled={selected.size === 0} onClick={() => setSheetTarget('single')} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--accent)] text-sm font-bold text-white disabled:opacity-40">
            <Plus size={15} />ADD {selected.size} EXERCISE{selected.size === 1 ? '' : 'S'}
          </button>
        )}
      </div>

      <AddToSessionSheet
        open={Boolean(sheetTarget)}
        onClose={() => setSheetTarget(null)}
        subtitle={sheetTarget === 'single' ? `${selected.size} exercises` : sheetTarget?.session ? `${sheetTarget.session.exercises.length} exercises` : ''}
        days={days}
        liveSession={liveSession?.startedAt ? liveSession : null}
        onConfirm={sheetTarget === 'single' ? handleConfirmSingleSession : handleConfirmSessionGroup}
      />

      {toast && <AddedToast dayName={toast.dayName} onUndo={async () => { await toast.undo(); setToast(null) }} />}
    </>
  )
}
