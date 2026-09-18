'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getWorkoutDays, saveWorkoutDays } from '@/lib/firebaseQueries'
import WorkoutDay from '@/components/WorkoutDay'
import './workouts.css'

export default function WorkoutsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

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
        if (data.length > 0) {
          setDays(data)
        } else {
          const defaultDays = [
            { id: 1, name: 'Chest and Back day', exercises: [] },
            { id: 2, name: 'Arms and Shoulders', exercises: [] },
            { id: 3, name: 'Legs', exercises: [] },
          ]
          setDays(defaultDays)
          await saveWorkoutDays(user.uid, defaultDays)
        }
      } catch (error) {
        console.error('Error loading workouts:', error)
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

  const handleAddExercise = (dayId) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        const newExercise = {
          id: Date.now(),
          name: 'New Exercise',
          isStarted: false,
          isCompleted: false,
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

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (authLoading || loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <>
      <nav>
        <Link href="/" className="active">Workouts</Link>
        <Link href="/metrics">Body Metrics</Link>
        <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: '14px' }}>
          Logout
        </button>
      </nav>
      <main>
        <h1>Workout Tracker</h1>
        <div className="workouts-container">
          {days.map(day => (
            <WorkoutDay
              key={day.id}
              day={day}
              onDayNameChange={handleDayNameChange}
              onAddExercise={handleAddExercise}
              onRemoveExercise={handleRemoveExercise}
              onUpdateExercise={handleUpdateExercise}
            />
          ))}
        </div>
      </main>
    </>
  )
}
