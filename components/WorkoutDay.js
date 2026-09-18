'use client'

import { useState } from 'react'
import Exercise from './Exercise'
import './WorkoutDay.css'

export default function WorkoutDay({
  day,
  onDayNameChange,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(day.name)

  const handleSaveName = () => {
    onDayNameChange(day.id, editedName)
    setIsEditingName(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(day.name)
    }
  }

  return (
    <div className="workout-day">
      <div className="day-header">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            autoFocus
            className="day-name-input"
          />
        ) : (
          <h2 
            className="day-name"
            onClick={() => setIsEditingName(true)}
            title="Click to edit"
          >
            {day.name}
          </h2>
        )}
        <button 
          className="add-exercise-btn"
          onClick={() => onAddExercise(day.id)}
          title="Add new exercise"
        >
          +
        </button>
      </div>

      <div className="exercises-list">
        {day.exercises.length === 0 ? (
          <p className="no-exercises">No exercises yet. Click + to add one.</p>
        ) : (
          day.exercises.map(exercise => (
            <Exercise
              key={exercise.id}
              exercise={exercise}
              dayId={day.id}
              onRemove={() => onRemoveExercise(day.id, exercise.id)}
              onUpdate={(updated) => onUpdateExercise(day.id, exercise.id, updated)}
            />
          ))
        )}
      </div>
    </div>
  )
}
