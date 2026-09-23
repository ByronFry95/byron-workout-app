'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, saveWorkoutLog } from '@/lib/firebaseQueries'
import AppNav from '@/components/AppNav'
import WorkoutDay from '@/components/WorkoutDay'
import WorkoutTimer from '@/components/WorkoutTimer'
import AddExerciseSheet from '@/components/library/AddExerciseSheet'
import { Pencil } from 'lucide-react'

export default function SessionPage() {
  const { user, loading: authLoading } = useAuth()
  const { session, endSession } = useWorkoutSession()
  const router = useRouter()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    getWorkoutDays(user.uid)
      .then(data => setDays(data.map(day => ({ ...day, isCollapsed: false, isStarted: Boolean(day.isStarted) }))))
      .catch(error => console.error('Error loading session:', error))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  useEffect(() => {
    if (!loading && user && days.length) saveWorkoutDays(user.uid, days)
  }, [days, loading, user])

  const activeDay = days.find(day => day.isStarted || day.id === session?.dayId)

  const handleDayNameChange = (id, newName) => {
    setDays(previous => previous.map(day => day.id === id ? { ...day, name: newName } : day))
  }

  const handleSaveName = () => {
    if (activeDay) handleDayNameChange(activeDay.id, editedName)
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  const handleConfirmAddExercise = (entry) => {
    if (!activeDay) return
    setDays(previous => previous.map(day => day.id === activeDay.id ? { ...day, exercises: [...day.exercises, entry] } : day))
  }

  const updateExercise = (dayId, exerciseId, updatedExercise) => {
    setDays(previous => previous.map(day => day.id === dayId
      ? { ...day, exercises: day.exercises.map(exercise => exercise.id === exerciseId ? updatedExercise : exercise) }
      : day
    ))
  }

  const handleEndSession = async () => {
    if (!activeDay || !session?.startedAt) {
      router.push('/')
      return
    }

    const finalSession = await endSession()
    const loggedExercises = activeDay.exercises
      .filter(exercise => exercise.isCompleted || exercise.isStarted)
      .map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        completedAt: exercise.completedAt || finalSession.endedAt,
        sets: exercise.sets
          .filter(set => set.currentWeight !== '' && set.currentReps !== '')
          .map(set => ({ setNumber: set.setNumber, weight: set.currentWeight, reps: set.currentReps, loggedAt: exercise.completedAt || finalSession.endedAt })),
      }))
      .filter(exercise => exercise.sets.length > 0)

    await saveWorkoutLog(user.uid, {
      dayId: activeDay.id,
      dayName: activeDay.name,
      startedAt: finalSession.startedAt,
      endedAt: finalSession.endedAt,
      durationMs: finalSession.durationMs,
      exercises: loggedExercises,
    })

    setDays(previous => previous.map(day => day.id === activeDay.id ? { ...day, isStarted: false } : day))
    router.push('/')
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading session...</div>
  if (!user) return null
  if (!activeDay) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">No active session.</div>

  return (
    <>
      <AppNav />
      <main className="p-0">
        <header className="sticky top-0 z-30 border-b-2 border-[var(--accent)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{new Date(session.startedAt).toLocaleDateString('en-GB')}</p>
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="w-full border-2 border-[var(--accent)] bg-[var(--surface)] px-2 py-1 text-xl text-[var(--ink)]"
                />
              ) : (
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-xl">{activeDay.name}</h1>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-xs text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-900"
                    onClick={() => {
                      setEditedName(activeDay.name)
                      setIsEditingName(true)
                    }}
                    title="Edit day name"
                    aria-label="Edit day name"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>
            <button type="button" onClick={handleEndSession} className="min-h-11 bg-[var(--accent)] px-3 text-xs font-bold text-white">END</button>
          </div>
          <WorkoutTimer session={session} onEndDay={handleEndSession} sticky showEndButton={false} />
        </header>
        <WorkoutDay
          day={activeDay}
          onDayNameChange={handleDayNameChange}
          onToggleCollapse={() => {}}
          onToggleDayStart={(_, started) => { if (!started) handleEndSession() }}
          onRemoveDay={() => {}}
          onAddExercise={() => setAddExerciseOpen(true)}
          onRemoveExercise={() => {}}
          onUpdateExercise={(dayId, exerciseId, updated) => updateExercise(dayId, exerciseId, updated)}
          sessionMode
        />
      </main>
      <AddExerciseSheet open={addExerciseOpen} onClose={() => setAddExerciseOpen(false)} dayName={activeDay.name} onAdd={handleConfirmAddExercise} />
    </>
  )
}
