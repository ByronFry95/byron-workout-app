'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Exercise from './Exercise'
import ReorderItem from './ReorderItem'
import PopoverMenu from './PopoverMenu'
import SwapExerciseSheet from './SwapExerciseSheet'
import ExerciseDetailSheet from './ExerciseDetailSheet'
import { ChevronDown, ChevronUp, Ellipsis, Layers, LayersPlus, ListChecks, Pencil, Plus, Trash2, X } from 'lucide-react'

export default function WorkoutDay({
  day,
  onDayNameChange,
  onToggleCollapse,
  onToggleDayStart,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onReorderExercises,
  onAddDay,
  onViewPrograms,
  programCount = 1,
  homeMode = false,
  sessionMode = false,
  sessionId = null,
  lastCompletedAt = null
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingExercises, setIsEditingExercises] = useState(false)
  const [editedName, setEditedName] = useState(day.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expandedExerciseId, setExpandedExerciseId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [swapTarget, setSwapTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const router = useRouter()
  const [draggingId, setDraggingId] = useState(null)
  const cardRef = useRef(null)
  const deleteActionRef = useRef(null)
  const animationFrame = useRef(null)
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
    if (cardRef.current) cardRef.current.style.transition = 'none'
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
    const nextDragX = Math.max(Math.min(delta, 0), -112)
    currentDragX.current = nextDragX
    didSwipe.current = Math.abs(nextDragX) > 8
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
    animationFrame.current = window.requestAnimationFrame(() => {
      if (cardRef.current) cardRef.current.style.transform = `translate3d(${nextDragX}px, 0, 0)`
      if (deleteActionRef.current) deleteActionRef.current.style.opacity = String(Math.min(1, Math.abs(nextDragX) / 64))
    })
  }

  const handlePointerUp = (event) => {
    if (event.target.closest('[data-exercise-card]')) return
    if (currentDragX.current <= -92) {
      setShowDeleteModal(true)
    }
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    currentDragX.current = 0
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
    window.requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)'
        cardRef.current.style.transform = 'translate3d(0, 0, 0)'
      }
      if (deleteActionRef.current) deleteActionRef.current.style.opacity = '0'
    })
  }

  const handlePointerCancel = (event) => {
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    currentDragX.current = 0
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)'
      cardRef.current.style.transform = 'translate3d(0, 0, 0)'
    }
    if (deleteActionRef.current) deleteActionRef.current.style.opacity = '0'
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

  const handleSwapExercise = chosen => {
    const target = swapTarget
    if (!target) return
    const libraryId = 'sets' in chosen ? chosen.libraryId : chosen.id
    const freshSets = target.sets.map(set => set.loggedAt ? set : { ...set, previousWeight: 0, previousReps: 0, currentWeight: '', currentReps: '' })
    onUpdateExercise(day.id, target.id, { ...target, name: chosen.name, equipment: chosen.equipment || '', libraryId: libraryId || null, sets: freshSets })
  }

  const workoutMenuItems = [
    onViewPrograms && { section: 'Program' },
    onViewPrograms && { label: 'View Programs', sub: `${programCount} program${programCount === 1 ? '' : 's'}`, icon: Layers, onSelect: onViewPrograms },
    { label: 'Create Program', icon: LayersPlus, onSelect: () => router.push('/library') },
    { divider: true },
    { section: "Today's workout" },
    { label: 'Rename Workout', icon: Pencil, onSelect: () => { setEditedName(day.name); setIsEditingName(true) } },
    { label: 'Edit Workout', icon: ListChecks, onSelect: () => setIsEditingExercises(true) },
    onAddDay && { label: 'Blank Workout', icon: Plus, onSelect: onAddDay },
  ].filter(Boolean)

  const exerciseCount = day.exercises.length
  const setCount = day.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  const lastCompletedLabel = lastCompletedAt ? new Date(lastCompletedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'

  return (
    <div className={`relative overflow-hidden ${homeMode ? 'day-glass-card' : sessionMode ? '' : 'border-2 border-[var(--divider)]'}`}>
      <div
        ref={cardRef}
        className={`relative z-10 overflow-hidden ${isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'} ${homeMode ? 'bg-transparent p-5' : sessionMode ? 'bg-transparent px-4 py-4' : 'panel-card p-5'}`}
        style={{ transform: 'translate3d(0, 0, 0)', touchAction: 'pan-y', willChange: 'transform' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="mt-1 w-full border-2 border-[var(--accent)] bg-[var(--surface)] px-2 py-1 text-3xl text-[var(--ink)]"
              />
            ) : (
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 flex-1 break-words text-3xl text-[var(--ink)]">{day.name}</h2>
                <PopoverMenu items={workoutMenuItems} ariaLabel="Workout options"><Ellipsis size={18} /></PopoverMenu>

              </div>
            )}
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
              className="glass-pill mt-4 w-full text-sm"
            >
              {day.isStarted ? 'END SESSION' : 'START SESSION'}
            </button>
          </div>
        )}

        {!sessionMode && homeMode && isEditingExercises && <div className="mb-2 flex items-center justify-between border-b-2 border-[var(--divider)] pb-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink)]">Editing workout</span>
          <button type="button" onClick={() => setIsEditingExercises(false)} className="flex h-9 items-center rounded-full bg-[var(--ink)] px-4 text-xs font-bold text-white">Done</button>
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
                <ReorderItem key={exercise.id} id={exercise.id} dragging={draggingId === exercise.id} onDragStart={setDraggingId} onDragOver={(from, to) => onReorderExercises?.(day.id, from, to)} onDragEnd={() => setDraggingId(null)}>
                <Exercise
                  key={`${exercise.id}-${exercise.libraryId || exercise.name}`}
                  exercise={exercise}
                  onSwap={setSwapTarget}
                  onView={setViewTarget}
                  
                  dayId={day.id}
                  sessionId={sessionId}
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
                </ReorderItem>
              ))
            )}
          </div>
        </div>

        {!day.isCollapsed && day.exercises.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onAddExercise(day.id)}
              className="min-h-12 w-full rounded-full border-2 border-dashed border-[var(--divider)] bg-white/60 px-3 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus size={17} />
                Add Exercise
              </span>
            </button>
          </div>
        )}
      </div>

      <div ref={deleteActionRef} className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-28 flex-col items-center justify-center gap-1 bg-[var(--accent)] text-white opacity-0">
        <Trash2 size={20} aria-hidden="true" />
        <span className="text-[0.65rem] font-bold uppercase">Delete day</span>
      </div>

      <SwapExerciseSheet open={Boolean(swapTarget)} onClose={() => setSwapTarget(null)} exercise={swapTarget} dayName={day.name} onSwap={handleSwapExercise} />
      <ExerciseDetailSheet open={Boolean(viewTarget)} onClose={() => setViewTarget(null)} exercise={viewTarget} />

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
