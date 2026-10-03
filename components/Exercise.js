'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeftRight, Check, ChevronDown, ChevronUp, ChevronUp as WeightUp, Copy, Dumbbell, Ellipsis, Minus, Pencil, Play, Plus, Square, Trash2, X } from 'lucide-react'
import PopoverMenu from './PopoverMenu'
import { getExerciseSettings } from '@/lib/exerciseSettings'

export default function Exercise({ exercise, dayId, sessionId, isExpanded, isOtherExerciseExpanded, homeMode = false, editMode = false, sessionMode = false, onExpand, onCollapse, onRemove, onUpdate, onSwap, onView, onEditWorkout }) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(exercise.name)
  const [sets, setSets] = useState(exercise.sets)
  const [isStarted, setIsStarted] = useState(exercise.isStarted || false)
  const [isCollapsed, setIsCollapsed] = useState(exercise.isCollapsed ?? false)
  const [markForIncrease, setMarkForIncrease] = useState(exercise.markForIncrease || false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showUndo, setShowUndo] = useState(false)
  const [undoState, setUndoState] = useState(null)
  const [activeSetEditor, setActiveSetEditor] = useState(null)
  const [completedSetNumbers, setCompletedSetNumbers] = useState(new Set())
  const [resolvedEquipment, setResolvedEquipment] = useState(exercise.equipment || '')

  useEffect(() => {
    if (exercise.equipment) {
      setResolvedEquipment(exercise.equipment)
      return
    }
    if (!exercise.libraryId) return

    import('@/lib/exerciseLibrary').then(({ getExerciseById }) => {
      setResolvedEquipment(getExerciseById(exercise.libraryId)?.equipment || '')
    })
  }, [exercise.equipment, exercise.libraryId])

  useEffect(() => {
    setIsStarted(Boolean(exercise.isStarted))
  }, [exercise.isStarted])

  useEffect(() => {
    if ((isExpanded || editMode || isEditing) && isCollapsed) {
      setIsCollapsed(false)
    } else if (isOtherExerciseExpanded && !isCollapsed && !editMode && !isEditing) {
      setIsCollapsed(true)
    }
  }, [isExpanded, isOtherExerciseExpanded, isCollapsed, editMode, isEditing])

  const handleCardTap = (event) => {
    event.stopPropagation()
    if (event.target.closest('button, input, textarea, select, a')) return
    if (editMode || isEditing) return
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
      currentWeight: set.currentWeight || set.previousWeight || '',
      currentReps: set.currentReps || set.previousReps || ''
    }))

    setSets(updatedSets)
    setIsStarted(true)
    setIsCollapsed(false)
    onExpand(exercise.id)
    onUpdate({
      ...exercise,
      sets: updatedSets,
      isStarted: true,
      isCompleted: false,
      isCollapsed: false,
      markForIncrease
    })
  }

  const handleCompleteExercise = () => {
    setUndoState({ isStarted, isCollapsed, sets })
    confirmCompleteExercise()
  }

  const confirmCompleteExercise = () => {
    setIsStarted(false)
    setIsCollapsed(true)
    onCollapse(exercise.id)
    setShowConfirmModal(false)
    setShowUndo(true)
    window.setTimeout(() => setShowUndo(false), 5000)

    onUpdate({
      ...exercise,
      sets,
      isStarted: false,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      isCollapsed: true,
      markForIncrease
    })
  }

  const handleUndoComplete = () => {
    if (!undoState) return
    setIsStarted(undoState.isStarted)
    setIsCollapsed(undoState.isCollapsed)
    setSets(undoState.sets)
    onExpand(exercise.id)
    onUpdate({ ...exercise, sets: undoState.sets, isStarted: undoState.isStarted, isCollapsed: undoState.isCollapsed, isCompleted: false, markForIncrease })
    setShowUndo(false)
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

  const handleSaveSet = (setNumber) => {
    setCompletedSetNumbers(previous => new Set(previous).add(setNumber))
    const loggedAt = new Date().toISOString()
    const updatedSets = sets.map(set => set.setNumber === setNumber
      ? { ...set, loggedAt, loggedSessionId: sessionId ?? null }
      : set
    )
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCollapsed, markForIncrease })
    navigator.vibrate?.(15)
    setActiveSetEditor(null)
  }

  const adjustSetValue = (setNumber, field, amount) => {
    const set = sets.find(item => item.setNumber === setNumber)
    const value = Number(set?.[field] || 0) + amount
    handleSetChange(setNumber, field, String(Math.max(0, value)))
  }

  const isDumbbell = resolvedEquipment.toLowerCase().includes('dumbbell')
  const weightStep = getExerciseSettings(exercise).increment ?? (isDumbbell ? 2 : 2.5)
  const quickWeightIncrements = isDumbbell ? [2, 4, 6] : [5, 10, 20]

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

  const handleCopyPrevious = (setNumber) => {
    const updatedSets = sets.map(set => set.setNumber === setNumber
      ? { ...set, currentWeight: String(set.previousWeight || ''), currentReps: String(set.previousReps || '') }
      : set)
    setSets(updatedSets)
    onUpdate({ ...exercise, sets: updatedSets, isStarted, isCollapsed, markForIncrease })
    navigator.vibrate?.(10)
  }

  const menuItems = [
    onSwap && { label: 'Swap exercise', icon: ArrowLeftRight, onSelect: () => onSwap(exercise) },
    { label: 'Edit exercise', icon: Pencil, onSelect: () => setIsEditing(true) },
    onView && { divider: true },
    onView && { label: 'View exercise', icon: Dumbbell, onSelect: () => onView(exercise) },
  ].filter(Boolean)
  const editing = editMode || isEditing
  const setGridCols = editing ? 'grid-cols-[2.5rem_1fr_1fr_1fr_5.5rem]' : 'grid-cols-[2.5rem_1fr_1fr_1fr_2.75rem]'
  const actionMenu = menuItems.length > 0 && (
    <PopoverMenu items={menuItems} ariaLabel={`Actions for ${exercise.name}`}><Ellipsis size={18} /></PopoverMenu>
  )

  return (
    <div data-exercise-card className={`exercise-card exercise-glass relative w-full min-w-0 overflow-hidden p-4 text-[var(--ink)] transition-all duration-300 ${isStarted ? '!border-[var(--accent)] !bg-[var(--accent-100)]' : ''}`} onClick={handleCardTap}>
      <div className="flex min-h-12 min-w-0 items-center gap-3">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="min-w-0 flex-1 rounded-xl border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-base font-medium text-[var(--ink)] outline-none"
          />
        ) : (
          <div className="min-w-0 flex-1 text-[var(--ink)]">
            <h3 className="min-w-0 max-w-full break-words text-lg font-semibold leading-snug text-[var(--ink)]">{exercise.name}</h3>
            {isStarted && <span className="mt-1 inline-block rounded-full bg-[var(--accent-100)] px-2 py-1 text-[0.65rem] font-bold text-[var(--accent)]">In Progress</span>}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {sessionMode && <button
            type="button"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[var(--n-300)] sm:flex"
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
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>}

          {sessionMode && <button
            type="button"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${markForIncrease ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--n-500)] bg-transparent text-[var(--n-700)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
            onClick={handleToggleMarkForIncrease}
            title="Mark to increase weight next week"
          >
            <WeightUp size={17} aria-hidden="true" />
          </button>}

          {sessionMode && !isStarted && (
            <button
              type="button"
              className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[var(--accent)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-600)]"
              onClick={handleStartExercise}
              title="Start exercise - will save current week as previous week"
            >
              <Play size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Start</span>
            </button>
          )}

          {sessionMode && isStarted && (
            <button
              type="button"
              className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[var(--accent)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-600)]"
              onClick={handleCompleteExercise}
              title="Complete exercise - saves current week as previous week and resets"
            >
              <Square size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Complete</span>
            </button>
          )}

          {actionMenu}
        </div>
      </div>

      {editing && (
        <div className="mt-2 flex flex-wrap items-center gap-2" onClick={event => event.stopPropagation()}>
          <button type="button" onClick={() => { setEditedName(exercise.name); setIsEditingName(true) }} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--divider)] px-4 text-xs font-bold"><Pencil size={13} />Edit name</button>
          <button type="button" onClick={onRemove} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--accent)] px-4 text-xs font-bold text-[var(--accent)]"><Trash2 size={13} />Remove exercise</button>
          {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="ml-auto flex h-9 items-center rounded-full bg-[var(--ink)] px-4 text-xs font-bold text-white">Done</button>}
        </div>
      )}

      {(markForIncrease || prLabel) && !homeMode && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {markForIncrease && <span className="bg-[var(--accent)] px-2 py-1 text-[0.65rem] font-bold text-white">UP NEXT</span>}
          {prLabel && <span className="border border-[var(--hairline)] px-2 py-1 text-[0.65rem] font-bold text-[var(--ink)]">{prLabel}</span>}
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'mt-4 opacity-100'}`}>
        <div className="flex flex-col gap-1 border-y-2 border-[var(--divider)]">
          <div className={`grid min-h-9 ${setGridCols} items-center gap-2 border-b-2 border-[var(--divider)] px-1 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--n-600)]`}>
            <span>Set</span>
            <span>Last Session</span>
            <span>Kg</span>
            <span>Reps</span>
            <span aria-hidden="true" />
          </div>
          {sets.map((set) => {
            const isSetComplete = Boolean(set.loggedAt) || completedSetNumbers.has(set.setNumber)

            return (
              <div key={set.setNumber} className={`grid min-h-12 ${setGridCols} items-center gap-2 border-b border-[var(--hairline)] px-1 py-1 ${isSetComplete ? 'opacity-45' : ''}`}>
                <span className="num text-sm text-[var(--n-700)]">{set.setNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrevious(set.setNumber)}
                  disabled={!set.previousWeight && !set.previousReps}
                  className="flex min-h-11 min-w-0 items-center gap-1 truncate border-0 bg-transparent text-left text-xs text-[var(--n-600)] underline decoration-dotted underline-offset-2 disabled:no-underline disabled:opacity-60"
                  title="Copy into this set"
                >
                  <Copy size={11} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{set.previousWeight || 0}kg / {set.previousReps || 0}</span>
                </button>
                <button type="button" onClick={() => setActiveSetEditor({ setNumber: set.setNumber, field: 'currentWeight' })} className="min-h-11 border-0 bg-transparent text-left num text-[var(--ink)]">{set.currentWeight || 'kg'}</button>
                <button type="button" onClick={() => setActiveSetEditor({ setNumber: set.setNumber, field: 'currentReps' })} className="min-h-11 border-0 bg-transparent text-left num text-[var(--ink)]">{set.currentReps || 'reps'}</button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleSaveSet(set.setNumber)} className="flex h-10 w-10 items-center justify-center border-2 border-[var(--accent)] bg-[var(--accent-100)] text-[var(--accent)]" aria-label={`Log set ${set.setNumber}`} title="Log set"><Check size={18} /></button>
                  {editing && <button type="button" onClick={() => handleRemoveSet(set.setNumber)} disabled={sets.length <= 1} className="flex h-10 w-10 items-center justify-center border-2 border-[var(--hairline)] text-[var(--n-600)] disabled:opacity-30" aria-label={`Remove set ${set.setNumber}`} title="Remove set"><X size={16} /></button>}
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="mt-4 min-h-11 bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
          onClick={handleAddSet}
          title="Add another set"
        >
          + Add Set
        </button>
      </div>

      {activeSetEditor && typeof document !== 'undefined' && createPortal((() => {
        const activeSet = sets.find(set => set.setNumber === activeSetEditor.setNumber)
        return (
          <div className="fixed inset-0 z-[60] flex items-end bg-black/40" onClick={() => setActiveSetEditor(null)}>
            <div role="dialog" aria-modal="true" className="w-full border-t-2 border-[var(--divider)] bg-[var(--surface)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]" onClick={event => event.stopPropagation()}>
              <div className="mx-auto mb-4 h-1 w-12 bg-[var(--n-500)]" />
              <div className="mb-4 flex items-center justify-between"><h3 className="text-xl">Set {activeSetEditor.setNumber} values</h3><button type="button" onClick={() => setActiveSetEditor(null)} className="flex h-11 w-11 items-center justify-center border-0 bg-transparent" aria-label="Close set editor"><X size={20} /></button></div>
              <div className="grid grid-cols-2 gap-3">
                {['currentWeight', 'currentReps'].map(field => {
                  const isWeight = field === 'currentWeight'
                  const step = isWeight ? weightStep : 1
                  return (
                    <div key={field}>
                      <label className="text-xs font-bold uppercase text-[var(--n-600)]">{isWeight ? 'Weight (kg)' : 'Reps'}</label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <button type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, -step)} className="flex h-11 w-10 shrink-0 items-center justify-center border-2 border-[var(--divider)]" aria-label={`Decrease ${isWeight ? 'weight' : 'reps'} by ${step}`}><Minus size={18} /></button>
                        <input type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={activeSet?.[field] || ''} onChange={event => handleSetChange(activeSetEditor.setNumber, field, event.target.value)} className="min-h-11 min-w-0 w-full border-2 border-[var(--divider)] bg-transparent px-2 num text-xl" />
                        <button type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, step)} className="flex h-11 w-10 shrink-0 items-center justify-center border-2 border-[var(--divider)]" aria-label={`Increase ${isWeight ? 'weight' : 'reps'} by ${step}`}><Plus size={18} /></button>
                      </div>
                      {isWeight && <div className="mt-2">
                        <span className="text-[0.65rem] font-bold uppercase text-[var(--n-600)]">Quick add</span>
                        <div className="mt-1 grid grid-cols-3 gap-1">
                          {quickWeightIncrements.map(amount => <button key={amount} type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, amount)} className="min-h-9 border border-[var(--divider)] px-1 text-xs font-bold">+{amount} kg</button>)}
                        </div>
                      </div>}
                    </div>
                  )
                })}
              </div>
              <button type="button" onClick={() => handleSaveSet(activeSetEditor.setNumber)} className="mt-4 min-h-11 w-full bg-[var(--accent)] font-bold text-white">LOG SET</button>
            </div>
          </div>
        )
      })(), document.body)}

      {showUndo && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 border-2 border-[var(--divider)] bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm">
          <span>Exercise completed</span>
          <button type="button" onClick={handleUndoComplete} className="min-h-11 px-3 text-[var(--accent)]">UNDO</button>
        </div>
      )}
    </div>
  )
}
