'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, saveWorkoutLog } from '@/lib/firebaseQueries'
import WorkoutDay from '@/components/WorkoutDay'
import WorkoutTimer from '@/components/WorkoutTimer'
import AddExerciseSheet from '@/components/library/AddExerciseSheet'
import { Ellipsis, Pencil, Plus } from 'lucide-react'
import { useNavTitle } from '@/components/NavShell'
import PopoverMenu from '@/components/PopoverMenu'

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
  useNavTitle(activeDay?.name)

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

  const reorderExercises = (dayId, fromId, toId) => setDays(previous => previous.map(day => { if (day.id !== dayId) return day; const from = day.exercises.findIndex(ex => String(ex.id) === String(fromId)); const to = day.exercises.findIndex(ex => String(ex.id) === String(toId)); if (from < 0 || to < 0 || from === to) return day; const exercises = [...day.exercises]; const [moved] = exercises.splice(from, 1); exercises.splice(to, 0, moved); return { ...day, exercises } }))

  const removeExercise = (dayId, exerciseId) => {
    setDays(previous => previous.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(exercise => exercise.id !== exerciseId) } : day))
  }

  const handleEndSession = async () => {
    if (!activeDay || !session?.startedAt) {
      router.push('/')
      return
    }

    const finalSession = await endSession()
    const activeSessionId = finalSession.sessionId ?? finalSession.startedAt
    const loggedExercises = activeDay.exercises
      .map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        libraryId: exercise.libraryId || null,
        completedAt: exercise.completedAt || finalSession.endedAt,
        sets: exercise.sets
          .filter(set => set.loggedSessionId === activeSessionId && set.currentWeight !== '' && set.currentReps !== '')
          .map(set => ({ setNumber: set.setNumber, weight: set.currentWeight, reps: set.currentReps, loggedAt: set.loggedAt })),
      }))
      .filter(exercise => exercise.sets.length > 0)

    await saveWorkoutLog(user.uid, {
      dayId: activeDay.id,
      dayName: activeDay.name,
      startedAt: finalSession.startedAt,
      endedAt: finalSession.endedAt,
      durationMs: finalSession.durationMs,
      sessionId: activeSessionId,
      exercises: loggedExercises,
    })

    setDays(previous => previous.map(day => day.id === activeDay.id
      ? { ...day, isStarted: false, exercises: day.exercises.map(exercise => ({ ...exercise, isStarted: false })) }
      : day
    ))
    router.push('/')
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading session...</div>
  if (!user) return null
  if (!activeDay) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">No active session.</div>

  return (
    <>
      <main className="p-0">
        <header className="sticky top-0 z-30 border-b-2 border-[var(--accent)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{new Date(session.startedAt).toLocaleDateString('en-GB')}</p>
              {isEditingName ? (
                <input
                  className="session-day-name w-full border-2 border-[var(--accent)] bg-[var(--surface)] px-2 py-1 text-xl text-[var(--ink)]"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                />
              ) : (
                <div className="session-day-name flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-xl">{activeDay.name}</h1>
                  <PopoverMenu ariaLabel="Workout options" items={[{ label: 'Rename workout', icon: Pencil, onSelect: () => { setEditedName(activeDay.name); setIsEditingName(true) } }, { label: 'Add exercise', icon: Plus, onSelect: () => setAddExerciseOpen(true) }]}><Ellipsis size={18} /></PopoverMenu>
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
          onRemoveExercise={removeExercise} onReorderExercises={reorderExercises}
          onUpdateExercise={(dayId, exerciseId, updated) => updateExercise(dayId, exerciseId, updated)}
          sessionMode
          sessionId={session.sessionId ?? session.startedAt}
        />
      </main>
      <AddExerciseSheet open={addExerciseOpen} onClose={() => setAddExerciseOpen(false)} dayName={activeDay.name} onAdd={handleConfirmAddExercise} />
    </>
  )
}
