'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, addExercisesToDay, createWorkoutDay, getWorkoutLogs } from '@/lib/firebaseQueries'
import { getExerciseById, buildWorkoutExerciseEntry } from '@/lib/exerciseLibrary'
import AddToSessionSheet from '@/components/library/AddToSessionSheet'
import AddedToast from '@/components/library/AddedToast'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { session: liveSession } = useWorkoutSession()
  const router = useRouter()

  const exercise = getExerciseById(id)
  const [days, setDays] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    Promise.all([getWorkoutDays(user.uid), getWorkoutLogs(user.uid, 400)])
      .then(([dayData, logData]) => { setDays(dayData); setLogs(logData) })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const history = useMemo(() => {
    if (!exercise) return null
    const sets = logs.flatMap(log => (log.exercises || []).filter(entry => entry.libraryId === exercise.id || entry.name === exercise.name).flatMap(entry => entry.sets || []))
    if (sets.length === 0) return null
    const topSet = sets.reduce((max, set) => Number(set.weight) > Number(max?.weight || 0) ? set : max, null)
    const estOneRm = topSet ? Math.round(Number(topSet.weight) * (1 + Number(topSet.reps) / 30) * 10) / 10 : null
    const lastLog = logs.find(log => (log.exercises || []).some(entry => entry.libraryId === exercise.id || entry.name === exercise.name))
    return { topSet: topSet?.weight, estOneRm, lastDone: lastLog ? new Date(lastLog.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : null }
  }, [logs, exercise])

  const addedToDay = exercise ? days.find(day => (day.exercises || []).some(entry => entry.libraryId === exercise.id))?.name : null

  const handleConfirm = async ({ dayId, startingSets }) => {
    const previousDays = days
    const entry = buildWorkoutExerciseEntry(exercise, startingSets)
    if (dayId) {
      const updatedDays = await addExercisesToDay(user.uid, dayId, [entry])
      setDays(updatedDays)
      setToast({ dayName: updatedDays.find(day => day.id === dayId)?.name, undo: async () => { setDays(previousDays); await saveWorkoutDays(user.uid, previousDays) } })
    } else {
      const updatedDays = await createWorkoutDay(user.uid, 'New Day', [entry])
      setDays(updatedDays)
      setToast({ dayName: 'New Day', undo: async () => { setDays(previousDays); await saveWorkoutDays(user.uid, previousDays) } })
    }
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading exercise...</div>
  if (!user) return null
  if (!exercise) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Exercise not found. <Link href="/library" className="font-bold text-[var(--accent)]">Back to library</Link></div>

  return (
    <>
      <div className="border-b-2 border-[var(--divider)] bg-[var(--surface)] px-5 py-3">
        <Link href="/library" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.09em]"><ChevronLeft size={16} />Library</Link>
      </div>
      <main className="pb-28">
        <h1 className="mb-3 text-3xl text-[var(--ink)]">{exercise.name}</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="border-2 border-[var(--hairline)] px-2 py-1 text-xs font-bold">{exercise.bodyPart}</span>
          <span className="border-2 border-[var(--hairline)] px-2 py-1 text-xs font-bold">{exercise.movement}</span>
          <span className="border-2 border-[var(--hairline)] px-2 py-1 text-xs font-bold">{exercise.equipment}</span>
          <span className="border-2 border-[var(--hairline)] px-2 py-1 text-xs font-bold text-[var(--n-600)]">{exercise.category}</span>
          {addedToDay && <span className="border-2 border-[var(--accent)] bg-[var(--accent-100)] px-2 py-1 text-xs font-bold text-[var(--accent-700)]">In {addedToDay}</span>}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-[var(--ink)]">{exercise.description}</p>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">How to</p>
        <div className="mb-6 border-t-2 border-[var(--divider)]">
          {exercise.steps.map((step, index) => (
            <div key={step} className="grid grid-cols-[22px_1fr] gap-2 border-b border-[var(--hairline)] py-2">
              <span className="num text-sm text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-sm leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">Your history</p>
        <div className="grid grid-cols-3 gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">
          <div className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">Top set</p><p className="num mt-1 text-lg">{history?.topSet ? `${history.topSet}kg` : '--'}</p></div>
          <div className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">Est. 1RM</p><p className="num mt-1 text-lg">{history?.estOneRm ? `${history.estOneRm}kg` : '--'}</p></div>
          <div className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">Last done</p><p className="num mt-1 text-lg">{history?.lastDone || '--'}</p></div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-30 border-t-2 border-[var(--divider)] bg-[var(--surface)] px-5 py-3 sm:bottom-0">
        <button type="button" onClick={() => setSheetOpen(true)} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--accent)] text-sm font-bold text-white">
          <Plus size={15} />ADD TO A SESSION
        </button>
      </div>

      <AddToSessionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        subtitle={`${exercise.name} · 3 sets`}
        days={days}
        liveSession={liveSession?.startedAt ? liveSession : null}
        showStartingSets
        onConfirm={handleConfirm}
      />

      {toast && <AddedToast dayName={toast.dayName} onUndo={async () => { await toast.undo(); setToast(null) }} />}
    </>
  )
}
