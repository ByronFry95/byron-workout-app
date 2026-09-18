'use client'

import { useState } from 'react'
import './Exercise.css'

export default function Exercise({ exercise, dayId, onRemove, onUpdate }) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(exercise.name)
  const [sets, setSets] = useState(exercise.sets)
  const [isStarted, setIsStarted] = useState(exercise.isStarted || false)
  const [isCompleted, setIsCompleted] = useState(exercise.isCompleted || false)
  const [markForIncrease, setMarkForIncrease] = useState(exercise.markForIncrease || false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleSaveName = () => {
    onUpdate({ ...exercise, name: editedName, sets, isStarted, isCompleted, markForIncrease })
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(exercise.name)
    }
  }

  const handleStartExercise = () => {
    // Move current week data to previous week
    const updatedSets = sets.map(set => ({
      ...set,
      previousWeight: set.currentWeight || set.previousWeight,
      previousReps: set.currentReps || set.previousReps,
      currentWeight: '',
      currentReps: ''
    }))
    
    setSets(updatedSets)
    setIsStarted(true)
    onUpdate({
      ...exercise,
      sets: updatedSets,
      isStarted: true,
      isCompleted: false,
      markForIncrease
    })
  }

  const handleCompleteExercise = () => {
    setShowConfirmModal(true)
  }

  const confirmCompleteExercise = () => {
    // Reset to initial state but keep the data that was completed
    const updatedSets = sets.map(set => ({
      ...set,
      previousWeight: set.currentWeight || set.previousWeight,
      previousReps: set.currentReps || set.previousReps,
      currentWeight: '',
      currentReps: ''
    }))
    
    setSets(updatedSets)
    setIsStarted(false)
    setIsCompleted(false)
    setShowConfirmModal(false)
    
    onUpdate({
      ...exercise,
      sets: updatedSets,
      isStarted: false,
      isCompleted: false,
      markForIncrease
    })
  }

  const handleToggleMarkForIncrease = () => {
    const newMarkState = !markForIncrease
    setMarkForIncrease(newMarkState)
    onUpdate({
      ...exercise,
      sets,
      isStarted,
      isCompleted,
      markForIncrease: newMarkState
    })
  }

  const handleSetChange = (setNumber, field, value) => {
    if (isCompleted) return // Prevent editing when completed
    const updatedSets = sets.map(set =>
      set.setNumber === setNumber
        ? { ...set, [field]: field === 'setNumber' ? value : value }
        : set
    )
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCompleted, markForIncrease })
  }

  const handleAddSet = () => {
    if (isCompleted) return // Prevent adding sets when completed
    const newSet = {
      setNumber: sets.length + 1,
      previousWeight: 0,
      previousReps: 0,
      currentWeight: '',
      currentReps: ''
    }
    const updatedSets = [...sets, newSet]
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCompleted, markForIncrease })
  }

  const handleRemoveSet = (setNumber) => {
    if (isCompleted) return // Prevent removing sets when completed
    if (sets.length <= 1) return // Keep at least one set
    const updatedSets = sets
      .filter(set => set.setNumber !== setNumber)
      .map((set, idx) => ({ ...set, setNumber: idx + 1 }))
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCompleted, markForIncrease })
  }

  return (
    <div className={`exercise ${isStarted ? 'exercise-started' : ''}`}>
      <div className="exercise-header">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="exercise-name-input"
          />
        ) : (
          <h3 
            className="exercise-name"
            onClick={() => setIsEditingName(true)}
            title="Click to edit"
          >
            {exercise.name}
            {isStarted && <span className="in-progress-badge">In Progress</span>}
            {markForIncrease && <span className="increase-badge">⬆ Weight +</span>}
          </h3>
        )}
        <div className="exercise-actions">
          <button
            className={`mark-increase-btn ${markForIncrease ? 'marked' : ''}`}
            onClick={handleToggleMarkForIncrease}
            title="Mark to increase weight next week"
          >
            ★
          </button>
          {!isStarted && (
            <button
              className="start-exercise-btn"
              onClick={handleStartExercise}
              title="Start exercise - will save current week as previous week"
            >
              Start
            </button>
          )}
          {isStarted && (
            <button
              className="complete-exercise-btn"
              onClick={handleCompleteExercise}
              title="Complete exercise - saves current week as previous week and resets"
            >
              Complete
            </button>
          )}
          <button
            className="remove-exercise-btn"
            onClick={onRemove}
            title="Remove exercise"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="sets-container">
        {sets.map((set) => (
          <div key={set.setNumber} className="set-row">
            <div className="set-label">Set {set.setNumber}</div>
            
            <div className="set-section">
              <div className="previous-data">
                <div className="data-group">
                  <label>Previous Week</label>
                  <div className="data-values">
                    <span className="weight">{set.previousWeight}kg</span>
                    <span className="reps">{set.previousReps}r</span>
                  </div>
                </div>
              </div>

              <div className="current-data">
                <div className="data-group">
                  <label>Current Week</label>
                  <input
                    type="number"
                    placeholder="Weight"
                    value={set.currentWeight}
                    onChange={(e) => handleSetChange(set.setNumber, 'currentWeight', e.target.value)}
                    className="input-field weight-input"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.currentReps}
                    onChange={(e) => handleSetChange(set.setNumber, 'currentReps', e.target.value)}
                    className="input-field reps-input"
                  />
                </div>
              </div>

              {sets.length > 1 && (
                <button
                  className="remove-set-btn"
                  onClick={() => handleRemoveSet(set.setNumber)}
                  title="Remove set"
                >
                  −
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-set-btn"
        onClick={handleAddSet}
        title="Add another set"
      >
        + Add Set
      </button>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Complete Exercise?</h3>
            <p>Are you sure you want to complete this exercise? Your current week data will be locked and cannot be edited.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="modal-confirm" onClick={confirmCompleteExercise}>
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
