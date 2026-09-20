'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getWorkoutDays, getWorkoutLogs, saveWorkoutDays, saveWorkoutLog } from '@/lib/firebaseQueries'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import WorkoutDay from '@/components/WorkoutDay'
import AppNav from '@/components/AppNav'
import { Plus } from 'lucide-react'

export default function WorkoutsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const { session: workoutSession, startSession, endSession, registerEndHandler } = useWorkoutSession()
  const router = useRouter()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [workoutLogs, setWorkoutLogs] = useState([])

  // Load from Firebase on mount
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const loadWorkouts = async () => {
      try {
        const data = await getWorkoutDays(user.uid)
        const logs = await getWorkoutLogs(user.uid)
        setWorkoutLogs(logs)
        if (data.length > 0) {
          setDays(data.map(day => ({ ...day, isCollapsed: Boolean(day.isCollapsed), isStarted: Boolean(day.isStarted) })))
        } else {
          const defaultDays = [
            { id: 1, name: 'Chest and Back day', isCollapsed: false, isStarted: false, exercises: [] },
            { id: 2, name: 'Arms and Shoulders', isCollapsed: false, isStarted: false, exercises: [] },
            { id: 3, name: 'Legs', isCollapsed: false, isStarted: false, exercises: [] },
          ]
          setDays(defaultDays)
          await saveWorkoutDays(user.uid, defaultDays)
        }

      } catch (error) {
        console.error('Error loading workouts:', error)
        setLoadError(error?.code || error?.message || 'Unable to load workouts from Firebase.')
      }
      setLoading(false)
    }

    loadWorkouts()
  }, [user, authLoading, router])

  // Save to Firebase whenever days change
  useEffect(() => {
    if (!loading && user && days.length > 0) {
      saveWorkoutDays(user.uid, days)
    }
  }, [days, loading, user])

  const handleDayNameChange = (id, newName) => {
    setDays(days.map(day =>
      day.id === id ? { ...day, name: newName } : day
    ))
  }

  const handleToggleDayCollapse = (id, collapsed) => {
    setDays(days.map(day =>
      day.id === id ? { ...day, isCollapsed: collapsed } : day
    ))
  }

  const handleToggleDayStart = async (id, started) => {
    const nextDayId = started ? id : null

    setDays(days.map(day => ({
      ...day,
      isStarted: day.id === nextDayId,
    })))

    if (started) {
      await startSession({ dayId: id }).catch(error => {
        console.error('Failed to save workout start:', error)
      })
      router.push('/session')
    } else {
      handleEndDay()
    }
  }

  const handleAddDay = () => {
    const newDay = {
      id: Date.now(),
      name: 'New Day',
      isCollapsed: false,
      isStarted: false,
      exercises: [],
    }

    setDays(prevDays => [...prevDays, newDay])
  }

  const handleRemoveDay = (dayId) => {
    const removedDay = days.find(day => day.id === dayId)

    setDays(prevDays => prevDays.filter(day => day.id !== dayId))

    if (removedDay?.isStarted) {
      endSession().catch(error => console.error('Failed to end removed day session:', error))
    }
  }

  const handleAddExercise = (dayId) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        const newExercise = {
          id: Date.now(),
          name: 'New Exercise',
          isStarted: false,
          isCompleted: false,
          isCollapsed: false,
          markForIncrease: false,
          sets: [
            { setNumber: 1, previousWeight: 0, previousReps: 0, currentWeight: '', currentReps: '' },
            { setNumber: 2, previousWeight: 0, previousReps: 0, currentWeight: '', currentReps: '' },
            { setNumber: 3, previousWeight: 0, previousReps: 0, currentWeight: '', currentReps: '' },
          ]
        }
        return { ...day, exercises: [...day.exercises, newExercise] }
      }
      return day
    }))
  }

  const handleRemoveExercise = (dayId, exerciseId) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
      }
      return day
    }))
  }

  const handleUpdateExercise = (dayId, exerciseId, updatedExercise) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex =>
            ex.id === exerciseId ? updatedExercise : ex
          )
        }
      }
      return day
    }))
  }

  const handleEndDay = async () => {
    const activeDay = days.find(day => day.isStarted)
    const activeDayId = activeDay?.id

    if (activeDayId) {
      setDays(days.map(day => (
        day.id === activeDayId ? { ...day, isStarted: false } : day
      )))
    }

    if (!workoutSession.startedAt) return

    try {
      const finalSession = await endSession()
      if (!finalSession) return
      const endedAt = finalSession.endedAt

      const completedExercises = (activeDay?.exercises || [])
        .filter(exercise => exercise.isCompleted)
        .map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          completedAt: exercise.completedAt || endedAt,
          sets: exercise.sets
            .filter(set => set.currentWeight !== '' && set.currentReps !== '')
            .map(set => ({
              setNumber: set.setNumber,
              weight: set.currentWeight,
              reps: set.currentReps,
              loggedAt: exercise.completedAt || endedAt,
            })),
        }))
        .filter(exercise => exercise.sets.length > 0)

      await saveWorkoutLog(user.uid, {
        dayId: activeDayId,
        dayName: activeDay?.name || 'Workout Day',
        startedAt: finalSession.startedAt,
        endedAt: finalSession.endedAt,
        durationMs: finalSession.durationMs,
        exercises: completedExercises,
      })
    } catch (error) {
      console.error('Failed to save workout session or log:', error)
    }
  }

  useEffect(() => registerEndHandler(handleEndDay), [registerEndHandler, workoutSession, days])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const startedDayId = days.find(day => day.isStarted)?.id
  const visibleDays = startedDayId ? days.filter(day => day.id === startedDayId) : days

  const getLastCompletedDate = (dayId) => workoutLogs.find(log => log.dayId === dayId)?.endedAt || null

  if (authLoading || loading) {
    return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading...</div>
  }

  if (!user) {
    return null
  }

  if (loadError) {
    return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Firebase error: {loadError}</div>
  }

  return (
    <>
      <AppNav />

      <main className="py-5">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Workout Tracker</h1>
        <div className="flex flex-col gap-5">
          {visibleDays.map(day => (
            <WorkoutDay
              key={day.id}
              day={day}
              onDayNameChange={handleDayNameChange}
              onToggleCollapse={handleToggleDayCollapse}
              onToggleDayStart={handleToggleDayStart}
              onRemoveDay={handleRemoveDay}
              onAddExercise={handleAddExercise}
              onRemoveExercise={handleRemoveExercise}
              onUpdateExercise={handleUpdateExercise}
              homeMode
              lastCompletedAt={getLastCompletedDate(day.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddDay}
          className="mt-6 w-full rounded-2xl border-2 border-dashed border-slate-800 bg-transparent p-2 text-left transition-opacity hover:opacity-95"
        >
          <span className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-slate-900">
            <Plus size={17} />
            Add Day
          </span>
        </button>
      </main>
    </>
  )
}
