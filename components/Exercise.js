'use client'

import { useEffect, useState } from 'react'

export default function Exercise({ exercise, dayId, isOtherExerciseExpanded, onExpand, onCollapse, onRemove, onUpdate }) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(exercise.name)
  const [sets, setSets] = useState(exercise.sets)
  const [isStarted, setIsStarted] = useState(exercise.isStarted || false)
  const [isCollapsed, setIsCollapsed] = useState(exercise.isCollapsed ?? false)
  const [markForIncrease, setMarkForIncrease] = useState(exercise.markForIncrease || false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    if (isOtherExerciseExpanded && !isCollapsed) {
      setIsCollapsed(true)
    }
  }, [isOtherExerciseExpanded, isCollapsed])

  const handleCardTap = (event) => {
    event.stopPropagation()
    if (event.target.closest('button, input, textarea, select, a')) return
    setIsCollapsed(previous => {
      const nextCollapsed = !previous
      if (nextCollapsed) {
        onCollapse(exercise.id)
      } else {
        onExpand(exercise.id)
      }
      return nextCollapsed
    })
  }

  const highestWeight = sets.reduce((max, set) => {
    const weight = Number(set.currentWeight || set.previousWeight || 0)
    return Number.isFinite(weight) ? Math.max(max, weight) : max
  }, 0)

  const prLabel = highestWeight > 0 ? `PR ${highestWeight}kg` : null

  const handleSaveName = () => {
    onUpdate({ ...exercise, name: editedName, sets, isStarted, isCollapsed, markForIncrease })
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
    const updatedSets = sets.map(set => ({
      ...set,
      previousWeight: set.currentWeight || set.previousWeight,
      previousReps: set.currentReps || set.previousReps,
      currentWeight: '',
      currentReps: ''
    }))

    setSets(updatedSets)
    setIsStarted(true)
    setIsCollapsed(false)
    onExpand(exercise.id)
    onUpdate({
      ...exercise,
      sets: updatedSets,
      isStarted: true,
      isCollapsed: false,
      markForIncrease
    })
  }

  const handleCompleteExercise = () => {
    setShowConfirmModal(true)
  }

  const confirmCompleteExercise = () => {
    setIsStarted(false)
    setIsCollapsed(true)
    onCollapse(exercise.id)
    setShowConfirmModal(false)

    onUpdate({
      ...exercise,
      sets,
      isStarted: false,
      isCollapsed: true,
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
      isCollapsed,
      markForIncrease: newMarkState
    })
  }

  const handleSetChange = (setNumber, field, value) => {
    const updatedSets = sets.map(set =>
      set.setNumber === setNumber
        ? { ...set, [field]: value }
        : set
    )
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCollapsed, markForIncrease })
  }

  const handleAddSet = () => {
    const newSet = {
      setNumber: sets.length + 1,
      previousWeight: 0,
      previousReps: 0,
      currentWeight: '',
      currentReps: ''
    }
    const updatedSets = [...sets, newSet]
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCollapsed, markForIncrease })
  }

  const handleRemoveSet = (setNumber) => {
    if (sets.length <= 1) return
    const updatedSets = sets
      .filter(set => set.setNumber !== setNumber)
      .map((set, idx) => ({ ...set, setNumber: idx + 1 }))
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCollapsed, markForIncrease })
  }

  const getDeltaTone = (delta) => {
    if (delta > 0) return 'text-emerald-300'
    if (delta < 0) return 'text-rose-300'
    return 'text-slate-400'
  }

  return (
    <div data-exercise-card className={`exercise-card w-full min-w-0 overflow-hidden rounded-2xl border p-3 transition-all duration-300 sm:p-4 ${isStarted ? 'border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : 'border-slate-700'} bg-slate-900`} onClick={handleCardTap}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="w-full max-w-[280px] rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-base font-medium text-white outline-none ring-0"
          />
        ) : (
          <div className="flex min-w-0 w-full flex-wrap items-center gap-2 text-white">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-xs text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
              onClick={() => setIsEditingName(true)}
              title="Edit exercise name"
              aria-label="Edit exercise name"
            >
              ✎
            </button>
            <h3 className="min-w-0 max-w-full break-words text-lg font-semibold text-white">{exercise.name}</h3>
            {isStarted && <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[0.65rem] font-bold text-blue-200">In Progress</span>}
          </div>
        )}

        <div className="flex w-full flex-nowrap gap-2 sm:grid sm:w-auto sm:grid-cols-4">
          <button
            type="button"
            className="hidden h-9 w-[2.5em] shrink-0 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-white transition-colors hover:bg-slate-600 sm:flex sm:h-8 sm:w-auto"
            onClick={() => {
              const nextCollapsed = !isCollapsed
              setIsCollapsed(nextCollapsed)
              if (nextCollapsed) {
                onCollapse(exercise.id)
              } else {
                onExpand(exercise.id)
              }
            }}
            title={isCollapsed ? 'Expand exercise' : 'Collapse exercise'}
            aria-label={isCollapsed ? 'Expand exercise' : 'Collapse exercise'}
          >
            {isCollapsed ? '▾' : '▴'}
          </button>

          <button
            type="button"
            className={`flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors sm:h-8 sm:w-auto ${markForIncrease ? 'border-amber-300 bg-amber-300 text-amber-950 shadow-[0_0_0_2px_rgba(251,191,36,0.35)]' : 'border-slate-500 bg-slate-700 text-slate-300 hover:border-amber-300 hover:bg-amber-950 hover:text-amber-200'}`}
            onClick={handleToggleMarkForIncrease}
            title="Mark to increase weight next week"
          >
            ★
          </button>

          {!isStarted && (
            <button
              type="button"
              className="flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-lg bg-emerald-500 px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 sm:h-auto sm:w-auto sm:px-3"
              onClick={handleStartExercise}
              title="Start exercise - will save current week as previous week"
            >
              <span className="sm:hidden" aria-hidden="true">▶</span>
              <span className="hidden sm:inline">Start</span>
            </button>
          )}

          {isStarted && (
            <button
              type="button"
              className="flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-lg bg-rose-600 px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 sm:h-auto sm:w-auto sm:bg-emerald-500 sm:px-3 sm:hover:bg-emerald-400"
              onClick={handleCompleteExercise}
              title="Complete exercise - saves current week as previous week and resets"
            >
              <span className="sm:hidden" aria-hidden="true">■</span>
              <span className="hidden sm:inline">Complete</span>
            </button>
          )}

          <button
            type="button"
            className="flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-lg bg-slate-700 px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600 sm:h-auto sm:w-auto sm:px-3"
            onClick={onRemove}
            title="Remove exercise"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {(markForIncrease || prLabel) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {markForIncrease && <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[0.65rem] font-bold text-amber-200">⬆ Weight +</span>}
          {prLabel && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[0.65rem] font-bold text-emerald-200">{prLabel}</span>}
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'mt-4 max-h-[1600px] opacity-100'}`}>
        <div className="flex flex-col gap-3">
          {sets.map((set) => {
            const previousWeight = Number(set.previousWeight || 0)
            const previousReps = Number(set.previousReps || 0)
            const currentWeight = Number(set.currentWeight || 0)
            const currentReps = Number(set.currentReps || 0)
            const weightDelta = currentWeight - previousWeight
            const repDelta = currentReps - previousReps

            return (
              <div key={set.setNumber} className="shrink-0 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Set {set.setNumber}</div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                    <div className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">Previous Week</div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-blue-100">{set.previousWeight || 0}kg</span>
                      <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-blue-100">{set.previousReps || 0}r</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                    <div className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">Current Week</div>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Weight"
                        value={set.currentWeight}
                        onChange={(e) => handleSetChange(set.setNumber, 'currentWeight', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-white placeholder:text-slate-400 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.currentReps}
                        onChange={(e) => handleSetChange(set.setNumber, 'currentReps', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-white placeholder:text-slate-400 outline-none"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border border-slate-600 bg-slate-800/80 px-2 py-1 text-[0.65rem] font-semibold ${getDeltaTone(weightDelta)}`}>
                        {weightDelta > 0 ? '+' : ''}{weightDelta}kg
                      </span>
                      <span className={`inline-flex rounded-full border border-slate-600 bg-slate-800/80 px-2 py-1 text-[0.65rem] font-semibold ${getDeltaTone(repDelta)}`}>
                        {repDelta > 0 ? '+' : ''}{repDelta}r
                      </span>
                    </div>
                  </div>
                </div>

                {sets.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="h-9 rounded-lg bg-slate-700 px-3 text-lg font-bold text-white transition-colors hover:bg-slate-600"
                      onClick={() => handleRemoveSet(set.setNumber)}
                      title="Remove set"
                    >
                      −
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          onClick={handleAddSet}
          title="Add another set"
        >
          + Add Set
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75">
          <div className="w-[min(90vw,420px)] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Complete Exercise?</h3>
            <p className="mb-4 text-sm leading-6 text-slate-300">
              Are you sure you want to complete this exercise? Your current week data will remain visible until you start this exercise again, when it will roll over to Previous Week.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white" onClick={confirmCompleteExercise}>
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
