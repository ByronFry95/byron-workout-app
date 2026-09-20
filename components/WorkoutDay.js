'use client'

import { useEffect, useRef, useState } from 'react'
import Exercise from './Exercise'
import { ChevronDown, ChevronUp, Minus, Pencil, Plus, X } from 'lucide-react'

export default function WorkoutDay({
  day,
  onDayNameChange,
  onToggleCollapse,
  onToggleDayStart,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  homeMode = false,
  sessionMode = false,
  lastCompletedAt = null
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingExercises, setIsEditingExercises] = useState(false)
  const [editedName, setEditedName] = useState(day.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expandedExerciseId, setExpandedExerciseId] = useState(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const currentDragX = useRef(0)
  const didSwipe = useRef(false)
  const startY = useRef(0)
  const axisLocked = useRef(false)
  const exerciseScrollRef = useRef(null)
  const previousExerciseCount = useRef(day.exercises.length)

  useEffect(() => {
    const previousCount = previousExerciseCount.current
    const currentCount = day.exercises.length

    if (currentCount > previousCount) {
      const newestExercise = day.exercises[currentCount - 1]
      setExpandedExerciseId(newestExercise.id)
      window.requestAnimationFrame(() => {
        exerciseScrollRef.current?.scrollTo({
          top: exerciseScrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      })
    }

    previousExerciseCount.current = currentCount
  }, [day.exercises])

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

  const handlePointerDown = (event) => {
    if (event.target.closest('[data-exercise-card]')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    setIsDragging(true)
    dragStartX.current = event.clientX
    startY.current = event.clientY
    axisLocked.current = false
    currentDragX.current = 0
    didSwipe.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isDragging || event.target.closest('[data-exercise-card]')) return
    const delta = event.clientX - dragStartX.current
    const verticalDelta = event.clientY - startY.current
    if (!axisLocked.current && Math.abs(delta) > 10) {
      axisLocked.current = Math.abs(delta) > Math.abs(verticalDelta)
    }
    if (!axisLocked.current) return
    if (delta < 0) {
      const nextDragX = Math.max(delta, -140)
      currentDragX.current = nextDragX
      didSwipe.current = Math.abs(nextDragX) > 8
      setDragX(nextDragX)
    }
  }

  const handlePointerUp = (event) => {
    if (event.target.closest('[data-exercise-card]')) return
    if (currentDragX.current <= -100) {
      setShowDeleteModal(true)
    }
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    currentDragX.current = 0
    setDragX(0)
  }

  const handleCardTap = (event) => {
    if (isDragging || didSwipe.current || Math.abs(currentDragX.current) > 8) return
    if (event.target.closest('button, input, textarea, select, a, [data-card-edit], [data-exercise-card]')) return
    onToggleCollapse(day.id, !day.isCollapsed)
  }

  const handleExerciseExpand = (exerciseId) => {
    setExpandedExerciseId(exerciseId)
  }

  const handleExerciseCollapse = (exerciseId) => {
    setExpandedExerciseId(previous => previous === exerciseId ? null : previous)
  }

  const exerciseCount = day.exercises.length
  const setCount = day.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  const lastCompletedLabel = lastCompletedAt ? new Date(lastCompletedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'

  return (
    <div className={`relative overflow-hidden ${homeMode || sessionMode ? '' : 'border-2 border-[var(--divider)]'}`}>
      <div
        className={`relative z-10 overflow-hidden transition-transform duration-200 ease-out ${homeMode || sessionMode ? 'bg-transparent' : 'panel-card p-5'}`}
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardTap}
      >
        {!sessionMode && !homeMode && <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 w-full sm:flex-1">
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full border-2 border-[var(--accent)] bg-[var(--surface)] px-2 py-2 text-xl font-semibold text-[var(--ink)]"
              />
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-xs text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-900"
                  onClick={() => setIsEditingName(true)}
                  title="Edit day name"
                  aria-label="Edit day name"
                >
                  <Pencil size={14} />
                </button>
                <h2 className="min-w-0 flex-1 break-words text-2xl font-semibold text-slate-800">
                  {day.name}
                </h2>
              </div>
            )}
          </div>

          <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
            <button
              type="button"
              className={day.isStarted ? 'min-h-11 flex-1 bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)] sm:flex-none' : 'min-h-11 flex-1 bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)] sm:flex-none'}
              onClick={(event) => {
                event.stopPropagation()
                onToggleDayStart(day.id, !day.isStarted)
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {day.isStarted ? 'End Session' : 'Start Session'}
            </button>

            <button
              type="button"
              className="hidden min-h-11 rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[var(--n-300)] sm:block"
              onClick={(event) => {
                event.stopPropagation()
                onToggleCollapse(day.id, !day.isCollapsed)
              }}
              title={day.isCollapsed ? 'Expand day' : 'Collapse day'}
            >
              {day.isCollapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
            </button>

            <button
              type="button"
              className="hidden min-h-11 rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent-100)] sm:block"
              onClick={(event) => {
                event.stopPropagation()
                setShowDeleteModal(true)
              }}
              title="Remove day"
            >
              <X size={17} />
            </button>
          </div>
        </div>}

        {homeMode && (
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--n-600)]">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <h2 className="mt-1 text-3xl text-[var(--ink)]">{day.name}</h2>
            <div className="mt-3 flex flex-wrap gap-5 border-y border-[var(--hairline)] py-2 text-xs font-bold uppercase tracking-wide text-[var(--n-600)]">
              <span>{exerciseCount} exercises</span><span>{setCount} sets</span><span>Last done {lastCompletedLabel}</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleDayStart(day.id, !day.isStarted)
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="mt-4 min-h-11 w-full bg-[var(--accent)] px-4 text-left text-sm font-bold text-white hover:bg-[var(--accent-600)]"
            >
              {day.isStarted ? 'END SESSION' : 'START SESSION'}
            </button>
          </div>
        )}

        {!sessionMode && homeMode && <div className="mb-2 flex items-center justify-between border-b-2 border-[var(--divider)] pb-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink)]">Exercises</span>
          <button type="button" onClick={() => setIsEditingExercises(previous => !previous)} className="min-h-11 px-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{isEditingExercises ? 'Done' : 'Edit'}</button>
        </div>}

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${day.isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100'}`}>
          <div ref={exerciseScrollRef} className="day-exercise-scroll flex min-h-0 flex-col gap-4 pr-1">
            {day.exercises.length === 0 ? (
              <div className="border-y border-[var(--hairline)] py-5 text-center">
                <p className="font-bold text-[var(--ink)]">No exercises yet</p>
                <p className="mt-1 text-sm text-[var(--n-600)]">Add your first movement to start this day.</p>
                <button type="button" onClick={() => onAddExercise(day.id)} className="mt-4 min-h-11 bg-[var(--accent)] px-4 text-sm font-bold text-white">ADD YOUR FIRST EXERCISE</button>
              </div>
            ) : (
              day.exercises.map(exercise => (
                <Exercise
                  key={exercise.id}
                  exercise={exercise}
                  dayId={day.id}
                  isExpanded={expandedExerciseId === exercise.id}
                  isOtherExerciseExpanded={expandedExerciseId !== null && expandedExerciseId !== exercise.id}
                  onExpand={handleExerciseExpand}
                  onCollapse={handleExerciseCollapse}
                  onRemove={() => onRemoveExercise(day.id, exercise.id)}
                  onUpdate={(updated) => onUpdateExercise(day.id, exercise.id, updated)}
                  homeMode={homeMode}
                  editMode={isEditingExercises}
                  sessionMode={sessionMode}
                />
              ))
            )}
          </div>
        </div>

        {!day.isCollapsed && !homeMode && !sessionMode && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onAddExercise(day.id)}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus size={17} />
                Add Exercise
              </span>
            </button>
          </div>
        )}
      </div>

      {dragX < 0 && (
        <div
          className="pointer-events-none absolute inset-y-2 right-[-8px] z-0 flex items-center justify-center border border-[var(--accent)] bg-[var(--accent-100)] shadow-sm"
          style={{ width: `${Math.min(Math.abs(dragX), 110)}px` }}
        >
          <div className="flex h-8 w-8 items-start justify-center border border-[var(--accent)] bg-[var(--accent-100)] pt-[2px] text-2xl font-bold leading-none text-[var(--accent-700)]">
            <Minus size={18} />
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full border-t-2 border-[var(--divider)] bg-[var(--surface)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:max-w-md" onClick={event => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-12 bg-[var(--n-500)]" />
            <h3 className="mb-2 text-xl">Remove Day?</h3>
            <p className="mb-4 text-sm text-[var(--n-600)]">
              Remove <span className="font-bold text-[var(--ink)]">{day.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="min-h-11 bg-transparent px-3 py-2 text-sm font-bold text-[var(--ink)]" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="min-h-11 bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white" onClick={() => {
                onRemoveDay(day.id)
                setShowDeleteModal(false)
              }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
