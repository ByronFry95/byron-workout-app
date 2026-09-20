'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, saveWorkoutLog } from '@/lib/firebaseQueries'
import AppNav from '@/components/AppNav'
import WorkoutDay from '@/components/WorkoutDay'
import WorkoutTimer from '@/components/WorkoutTimer'

export default function SessionPage() {
  const { user, loading: authLoading } = useAuth()
  const { session, endSession } = useWorkoutSession()
  const router = useRouter()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

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
    const completedExercises = activeDay.exercises
      .filter(exercise => exercise.isCompleted)
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
      exercises: completedExercises,
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
              <h1 className="truncate text-xl">{activeDay.name}</h1>
            </div>
            <button type="button" onClick={handleEndSession} className="min-h-11 bg-[var(--accent)] px-3 text-xs font-bold text-white">END</button>
          </div>
          <WorkoutTimer session={session} onEndDay={handleEndSession} sticky showEndButton={false} />
        </header>
        <WorkoutDay
          day={activeDay}
          onDayNameChange={(id, name) => setDays(previous => previous.map(day => day.id === id ? { ...day, name } : day))}
          onToggleCollapse={() => {}}
          onToggleDayStart={(_, started) => { if (!started) handleEndSession() }}
          onRemoveDay={() => {}}
          onAddExercise={() => {}}
          onRemoveExercise={() => {}}
          onUpdateExercise={(dayId, exerciseId, updated) => updateExercise(dayId, exerciseId, updated)}
          sessionMode
        />
      </main>
    </>
  )
}
