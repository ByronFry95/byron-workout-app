'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import WorkoutDay from '@/components/WorkoutDay'
import './workouts.css'

export default function WorkoutsPage() {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('workoutDays')
    if (savedData) {
      setDays(JSON.parse(savedData))
    } else {
      // Initialize with default workout days
      const defaultDays = [
        { id: 1, name: 'Chest and Back day', exercises: [] },
        { id: 2, name: 'Arms and Shoulders', exercises: [] },
        { id: 3, name: 'Legs', exercises: [] },
      ]
      setDays(defaultDays)
      localStorage.setItem('workoutDays', JSON.stringify(defaultDays))
    }
    setLoading(false)
  }, [])

  // Save to localStorage whenever days change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('workoutDays', JSON.stringify(days))
    }
  }, [days, loading])

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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <nav>
        <Link href="/" className="active">Workouts</Link>
        <Link href="/metrics">Body Metrics</Link>
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
