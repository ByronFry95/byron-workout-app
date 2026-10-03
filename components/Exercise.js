'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Check, Dumbbell, Ellipsis, Link2, Minus, Pencil, Play, Plus, Split, Square, StickyNote, Trash2, TrendingUp, Trophy, X } from 'lucide-react'
import PopoverMenu from './PopoverMenu'
import Sheet from './Sheet'
import { getExerciseSettings } from '@/lib/exerciseSettings'
import { bestPreviousOneRepMax, completeExerciseState, estimateOneRepMax, isSetLoggedThisSession, startExerciseState } from '@/lib/sessionMath'

const SIDES = {
  left: { weight: 'currentWeight', reps: 'currentReps', prevWeight: 'previousWeight', prevReps: 'previousReps', logged: 'loggedAt', label: 'left' },
  right: { weight: 'currentWeightRight', reps: 'currentRepsRight', prevWeight: 'previousWeightRight', prevReps: 'previousRepsRight', logged: 'loggedAtRight', label: 'right' },
}

const withRightDefaults = set => ({
  ...set,
  currentWeightRight: set.currentWeightRight ?? set.currentWeight ?? '',
  currentRepsRight: set.currentRepsRight ?? set.currentReps ?? '',
  previousWeightRight: set.previousWeightRight ?? set.previousWeight ?? 0,
  previousRepsRight: set.previousRepsRight ?? set.previousReps ?? 0,
})

export default function Exercise({
  exercise, dayId, sessionId, isExpanded, isOtherExerciseExpanded,
  homeMode = false, editMode = false, sessionMode = false, embedded = false, badge = null,
  onExpand, onCollapse, onRemove, onUpdate, onSwap, onView, onSuperset, onUnsuperset, onSetLogged,
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(exercise.name)
  const [sets, setSets] = useState(exercise.sets)
  const [isStarted, setIsStarted] = useState(exercise.isStarted || false)
  const [isCollapsed, setIsCollapsed] = useState(exercise.isCollapsed ?? false)
  const [markForIncrease, setMarkForIncrease] = useState(exercise.markForIncrease || false)
  const [showUndo, setShowUndo] = useState(false)
  const [undoState, setUndoState] = useState(null)
  const [activeSetEditor, setActiveSetEditor] = useState(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [resolvedEquipment, setResolvedEquipment] = useState(exercise.equipment || '')
  const [autoUnilateral, setAutoUnilateral] = useState(false)
  const undoTimer = useRef(null)

  const unilateral = exercise.unilateral ?? autoUnilateral
  const sides = unilateral ? ['left', 'right'] : ['left']

  useEffect(() => {
    let cancelled = false
    import('@/lib/exerciseLibrary').then(({ resolveLibraryExercise, isUnilateral }) => {
      if (cancelled) return
      const entry = resolveLibraryExercise(exercise)
      setResolvedEquipment(exercise.equipment || entry?.equipment || '')
      setAutoUnilateral(isUnilateral(entry || exercise))
    })
    return () => { cancelled = true }
  }, [exercise.equipment, exercise.libraryId, exercise.name])

  useEffect(() => setSets(exercise.sets), [exercise.sets])
  useEffect(() => setIsStarted(Boolean(exercise.isStarted)), [exercise.isStarted])
  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  useEffect(() => {
    if (exercise.unilateral === undefined && autoUnilateral) {
      onUpdate({ ...exercise, unilateral: true, sets: exercise.sets.map(withRightDefaults) })
    }
  }, [autoUnilateral, exercise.unilateral])

  useEffect(() => {
    if ((isExpanded || editMode || isEditing) && isCollapsed) {
      setIsCollapsed(false)
    } else if (isOtherExerciseExpanded && !isCollapsed && !editMode && !isEditing) {
      setIsCollapsed(true)
    }
  }, [isExpanded, isOtherExerciseExpanded, isCollapsed, editMode, isEditing])

  const editing = editMode || isEditing
  const base = () => ({ ...exercise, sets, isStarted, isCollapsed, markForIncrease })
  const commit = patch => onUpdate({ ...base(), ...patch })

  const handleCardTap = event => {
    event.stopPropagation()
    if (event.target.closest('button, input, textarea, select, a')) return
    if (editing) return
    const nextCollapsed = !isCollapsed
    setIsCollapsed(nextCollapsed)
    if (nextCollapsed) onCollapse(exercise.id)
    else onExpand(exercise.id)
  }

  const handleSaveName = () => {
    commit({ name: editedName })
    setIsEditingName(false)
  }

  const handleStartExercise = () => {
    const next = startExerciseState(exercise, unilateral)
    setSets(next.sets)
    setIsStarted(true)
    setIsCollapsed(false)
    onExpand(exercise.id)
    onUpdate({ ...next, markForIncrease })
  }

  const handleCompleteExercise = () => {
    setUndoState({ isStarted, isCollapsed, sets })
    setIsStarted(false)
    setIsCollapsed(true)
    onCollapse(exercise.id)
    setShowUndo(true)
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setShowUndo(false), 5000)
    onUpdate({ ...completeExerciseState({ ...exercise, sets }), markForIncrease })
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

  const applySets = updated => {
    setSets(updated)
    onUpdate({ ...exercise, sets: updated, isStarted, isCollapsed, markForIncrease })
  }

  const handleSetChange = (setNumber, field, value) => {
    applySets(sets.map(set => {
      if (set.setNumber !== setNumber) return set
      const next = { ...set, [field]: value }
      if (unilateral && field === 'currentWeight' && (set.currentWeightRight === '' || set.currentWeightRight === undefined || set.currentWeightRight === set.currentWeight)) {
        next.currentWeightRight = value
      }
      return next
    }))
  }

  const adjustSetValue = (setNumber, field, amount) => {
    const set = sets.find(item => item.setNumber === setNumber)
    handleSetChange(setNumber, field, String(Math.max(0, Number(set?.[field] || 0) + amount)))
  }

  const logSet = (setNumber, side) => {
    const key = SIDES[side].logged
    const loggedAt = new Date().toISOString()
    applySets(sets.map(set => set.setNumber === setNumber ? { ...set, [key]: loggedAt, loggedSessionId: sessionId ?? null } : set))
    navigator.vibrate?.(15)
    setActiveSetEditor(null)
    onSetLogged?.(exercise.id)
  }

  const toggleSet = (set, side) => {
    if (isSetLoggedThisSession(set, side, sessionId)) {
      applySets(sets.map(item => item.setNumber === set.setNumber ? { ...item, [SIDES[side].logged]: null } : item))
      return
    }
    logSet(set.setNumber, side)
  }

  const handleAddSet = () => {
    const last = sets[sets.length - 1]
    const newSet = {
      setNumber: sets.length + 1,
      previousWeight: 0,
      previousReps: 0,
      currentWeight: '',
      currentReps: '',
      ...(unilateral ? { previousWeightRight: 0, previousRepsRight: 0, currentWeightRight: '', currentRepsRight: '' } : {}),
    }
    if (last && sessionMode) {
      newSet.currentWeight = last.currentWeight || ''
      newSet.currentReps = last.currentReps || ''
      if (unilateral) {
        newSet.currentWeightRight = last.currentWeightRight || ''
        newSet.currentRepsRight = last.currentRepsRight || ''
      }
    }
    applySets([...sets, newSet])
  }

  const handleRemoveSet = setNumber => {
    if (sets.length <= 1) return
    applySets(sets.filter(set => set.setNumber !== setNumber).map((set, index) => ({ ...set, setNumber: index + 1 })))
  }

  const toggleUnilateral = () => {
    const next = !unilateral
    commit({ unilateral: next, sets: next ? sets.map(withRightDefaults) : sets })
  }

  const toggleMarkForIncrease = () => {
    const next = !markForIncrease
    setMarkForIncrease(next)
    commit({ markForIncrease: next })
  }

  const openNote = () => {
    setNoteDraft(exercise.note || '')
    setNoteOpen(true)
  }

  const saveNote = () => {
    commit({ note: noteDraft.trim() })
    setNoteOpen(false)
  }

  const isDumbbell = resolvedEquipment.toLowerCase().includes('dumbbell')
  const weightStep = getExerciseSettings(exercise).increment ?? (isDumbbell ? 2 : 2.5)
  const quickWeightIncrements = isDumbbell ? [2, 4, 6] : [5, 10, 20]
  const previousBest = bestPreviousOneRepMax({ sets })

  const totalRows = sets.length * sides.length
  const loggedRows = sets.reduce((count, set) => count + sides.filter(side => isSetLoggedThisSession(set, side, sessionId)).length, 0)

  const menuItems = [
    { label: exercise.note ? 'Edit note' : 'Add note', icon: StickyNote, onSelect: openNote },
    sessionMode && onSuperset && !exercise.supersetId && { label: 'Create super set', icon: Link2, onSelect: () => onSuperset(exercise) },
    sessionMode && exercise.supersetId && onUnsuperset && { label: 'Remove from super set', icon: Link2, onSelect: () => onUnsuperset(exercise) },
    { divider: true },
    onSwap && { label: 'Swap exercise', icon: ArrowLeftRight, onSelect: () => onSwap(exercise) },
    { label: 'Edit exercise', icon: Pencil, onSelect: () => setIsEditing(true) },
    { label: 'Track left & right', sub: unilateral ? 'On' : 'Off', icon: Split, onSelect: toggleUnilateral },
    sessionMode && { label: markForIncrease ? 'Unmark increase' : 'Mark for increase', icon: TrendingUp, onSelect: toggleMarkForIncrease },
    onView && { label: 'View exercise', icon: Dumbbell, onSelect: () => onView(exercise) },
    { divider: true },
    { label: 'Delete exercise', icon: Trash2, danger: true, onSelect: () => { if (window.confirm(`Delete ${exercise.name}?`)) onRemove() } },
  ].filter(Boolean)

  const setGridCols = editing
    ? 'grid-cols-[2rem_3.5rem_1fr_1fr_2.4rem_2rem]'
    : 'grid-cols-[2rem_3.5rem_1fr_1fr_2.4rem]'

  const renderRow = (set, side) => {
    const keys = SIDES[side]
    const logged = isSetLoggedThisSession(set, side, sessionId)
    const isPB = logged && previousBest > 0 && estimateOneRepMax(set[keys.weight], set[keys.reps]) > previousBest
    const prevWeight = set[keys.prevWeight]
    const prevReps = set[keys.prevReps]
    const rowTone = isPB ? 'bg-amber-400/20' : logged ? 'bg-emerald-500/10' : ''
    const valueTone = isPB ? 'text-amber-700' : logged ? 'text-emerald-700' : 'text-[var(--ink)]'

    return (
      <div key={`${set.setNumber}-${side}`} className={`grid min-h-[3.25rem] ${setGridCols} items-center gap-2 rounded-2xl px-2 py-1 transition-colors ${rowTone}`}>
        {side === 'left' ? (
          <span className={`num flex h-8 w-8 items-center justify-center rounded-full text-sm ${isPB ? 'bg-amber-400 text-white' : logged ? 'bg-emerald-500 text-white' : 'bg-black/5 text-[var(--n-700)]'}`}>{set.setNumber}</span>
        ) : <span aria-hidden="true" />}
        <span className="num truncate text-xs text-[var(--n-600)]">{prevWeight || prevReps ? `${prevWeight || 0}×${prevReps || 0}` : '–'}</span>
        <button type="button" onClick={() => setActiveSetEditor({ setNumber: set.setNumber, field: keys.weight, side })} className={`flex h-10 min-w-0 items-center justify-center gap-1 rounded-xl border-0 bg-white/70 px-2 py-0 num text-base leading-none shadow-[inset_0_0_0_1px_var(--hairline)] ${valueTone}`}>
          <span className="leading-none">{set[keys.weight] || <span className="text-[var(--n-500)]">0</span>}</span><span className="text-xs leading-none opacity-60">kg</span>
        </button>
        <button type="button" onClick={() => setActiveSetEditor({ setNumber: set.setNumber, field: keys.reps, side })} className={`flex h-10 min-w-0 items-center justify-center gap-1 rounded-xl border-0 bg-white/70 px-2 py-0 num text-base leading-none shadow-[inset_0_0_0_1px_var(--hairline)] ${valueTone}`}>
          <span className="leading-none">{set[keys.reps] || <span className="text-[var(--n-500)]">0</span>}</span><span className="truncate text-xs leading-none opacity-60">{unilateral ? keys.label : 'reps'}</span>
        </button>
        <button type="button" onClick={() => toggleSet(set, side)} className={`flex h-9 w-9 items-center justify-center rounded-full border-0 transition-colors ${isPB ? 'bg-amber-400 text-white' : logged ? 'bg-emerald-500 text-white' : 'bg-black/5 text-[var(--n-600)]'}`} aria-label={`Log set ${set.setNumber}${unilateral ? ` ${keys.label}` : ''}`} title="Log set">
          {isPB ? <Trophy size={16} /> : <Check size={17} />}
        </button>
        {editing && (side === 'left'
          ? <button type="button" onClick={() => handleRemoveSet(set.setNumber)} disabled={sets.length <= 1} className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-black/5 text-[var(--n-600)] disabled:opacity-30" aria-label={`Remove set ${set.setNumber}`} title="Remove set"><X size={15} /></button>
          : <span aria-hidden="true" />)}
      </div>
    )
  }

  const activeSet = activeSetEditor ? sets.find(set => set.setNumber === activeSetEditor.setNumber) : null
  const editorIsWeight = activeSetEditor?.field.startsWith('currentWeight')
  const editorStep = editorIsWeight ? weightStep : 1

  const cardClass = embedded
    ? `relative w-full min-w-0 overflow-hidden rounded-2xl bg-white/55 p-3 text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)] transition-all duration-300`
    : `exercise-card exercise-glass relative w-full min-w-0 overflow-hidden p-4 text-[var(--ink)] transition-all duration-300 ${isStarted ? '!border-[var(--accent)] !bg-[var(--accent-100)]' : ''}`

  return (
    <div data-exercise-card className={cardClass} onClick={handleCardTap}>
      <div className="flex min-h-12 min-w-0 items-center gap-3">
        {badge && <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${badge.className}`}>{badge.label}</span>}
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={event => setEditedName(event.target.value)}
            onBlur={handleSaveName}
            onKeyDown={event => { if (event.key === 'Enter') handleSaveName(); if (event.key === 'Escape') { setIsEditingName(false); setEditedName(exercise.name) } }}
            autoFocus
            className="min-w-0 flex-1 rounded-xl border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-base font-medium text-[var(--ink)] outline-none"
          />
        ) : (
          <div className="min-w-0 flex-1">
            {resolvedEquipment && <p className="truncate text-xs font-semibold text-[var(--n-600)]">{resolvedEquipment}</p>}
            <h3 className="min-w-0 max-w-full break-words text-lg font-semibold leading-snug text-[var(--ink)]">{exercise.name}</h3>
            {(isStarted || markForIncrease) && !embedded && (
              <div className="mt-1 flex gap-1.5">
                {isStarted && <span className="rounded-full bg-[var(--accent-100)] px-2 py-0.5 text-[0.65rem] font-bold text-[var(--accent)]">In progress</span>}
                {markForIncrease && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[0.65rem] font-bold text-white">Increase next</span>}
              </div>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {sessionMode && !embedded && !isStarted && (
            <button type="button" className="flex h-9 items-center justify-center gap-1 rounded-full border-0 bg-[var(--ink)] px-3.5 text-xs font-bold text-white" onClick={handleStartExercise} title="Start exercise - saves the last session for comparison">
              <Play size={13} aria-hidden="true" />Start
            </button>
          )}
          {sessionMode && !embedded && isStarted && (
            <button type="button" className="flex h-9 items-center justify-center gap-1 rounded-full border-0 bg-[var(--accent)] px-3.5 text-xs font-bold text-white" onClick={handleCompleteExercise} title="Finish exercise">
              <Square size={12} aria-hidden="true" />Done
            </button>
          )}
          <PopoverMenu items={menuItems} ariaLabel={`Actions for ${exercise.name}`}><Ellipsis size={18} /></PopoverMenu>
        </div>
      </div>

      {exercise.note && (
        <button type="button" onClick={openNote} className="mt-2 flex w-full items-start gap-2 rounded-xl border-0 bg-amber-400/15 px-3 py-2 text-left text-xs text-[var(--ink)]">
          <StickyNote size={14} className="mt-0.5 shrink-0 text-amber-600" /><span className="min-w-0 whitespace-pre-wrap break-words">{exercise.note}</span>
        </button>
      )}

      {editing && (
        <div className="mt-2 flex flex-wrap items-center gap-2" onClick={event => event.stopPropagation()}>
          <button type="button" onClick={() => { setEditedName(exercise.name); setIsEditingName(true) }} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--divider)] bg-transparent px-4 text-xs font-bold"><Pencil size={13} />Edit name</button>
          <button type="button" onClick={onRemove} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--accent)] bg-transparent px-4 text-xs font-bold text-[var(--accent)]"><Trash2 size={13} />Remove exercise</button>
          {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="ml-auto flex h-9 items-center rounded-full border-0 bg-[var(--ink)] px-4 text-xs font-bold text-white">Done</button>}
        </div>
      )}

      {isCollapsed && sessionMode && totalRows > 0 && (
        <p className="mt-1 text-xs font-semibold text-[var(--n-600)]">{loggedRows}/{totalRows} sets logged</p>
      )}

      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'mt-3 opacity-100'}`}>
        <div className={`grid ${setGridCols} items-center gap-2 px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--n-600)]`}>
          <span>Set</span><span>Last</span><span className="text-center">Weight</span><span className="text-center">Reps</span><span aria-hidden="true" />{editing && <span aria-hidden="true" />}
        </div>
        <div className="flex flex-col gap-1">
          {sets.flatMap(set => sides.map(side => renderRow(set, side)))}
        </div>

        <div className="mt-3 flex items-center">
          <button type="button" className="flex h-10 items-center gap-1.5 rounded-full border-0 bg-black/5 px-4 text-sm font-semibold text-[var(--ink)]" onClick={handleAddSet} title="Add another set">
            <Plus size={16} />Add set
          </button>
        </div>
      </div>

      <div onClick={event => event.stopPropagation()}>
      <Sheet open={Boolean(activeSetEditor)} onClose={() => setActiveSetEditor(null)} title={activeSetEditor ? `Set ${activeSetEditor.setNumber}${unilateral ? ` · ${SIDES[activeSetEditor.side].label}` : ''}` : ''}>
        {activeSetEditor && (
          <div className="pb-6">
            <div className="grid grid-cols-2 gap-3">
              {[SIDES[activeSetEditor.side].weight, SIDES[activeSetEditor.side].reps].map(field => {
                const isWeight = field.startsWith('currentWeight')
                const step = isWeight ? weightStep : 1
                return (
                  <div key={field}>
                    <label className="text-xs font-bold uppercase text-[var(--n-600)]">{isWeight ? 'Weight (kg)' : 'Reps'}</label>
                    <div className="mt-1 flex items-center gap-1.5">
                      <button type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, -step)} className="glass-icon-button shrink-0" aria-label={`Decrease ${isWeight ? 'weight' : 'reps'} by ${step}`}><Minus size={18} /></button>
                      <input type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={activeSet?.[field] || ''} onChange={event => handleSetChange(activeSetEditor.setNumber, field, event.target.value)} className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--hairline)] bg-white/70 px-2 text-center num text-xl" />
                      <button type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, step)} className="glass-icon-button shrink-0" aria-label={`Increase ${isWeight ? 'weight' : 'reps'} by ${step}`}><Plus size={18} /></button>
                    </div>
                    {isWeight && (
                      <div className="mt-2 grid grid-cols-3 gap-1">
                        {quickWeightIncrements.map(amount => <button key={amount} type="button" onClick={() => adjustSetValue(activeSetEditor.setNumber, field, amount)} className="glass-pill-light min-h-9 px-1 text-xs font-bold">+{amount}</button>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button type="button" onClick={() => logSet(activeSetEditor.setNumber, activeSetEditor.side)} className="glass-pill mt-5 w-full text-sm">LOG SET</button>
          </div>
        )}
      </Sheet>

      <Sheet open={noteOpen} onClose={() => setNoteOpen(false)} title={`Note · ${exercise.name}`}>
        <div className="pb-6">
          <textarea value={noteDraft} onChange={event => setNoteDraft(event.target.value)} rows={5} autoFocus placeholder="Cues, setup, how it felt..." className="w-full rounded-2xl border border-[var(--hairline)] bg-white/70 p-3 text-base outline-none" />
          <div className="mt-4 flex gap-2">
            {exercise.note && <button type="button" onClick={() => { commit({ note: '' }); setNoteOpen(false) }} className="glass-pill-light h-12 flex-1 text-sm font-bold">Delete note</button>}
            <button type="button" onClick={saveNote} className="glass-pill h-12 flex-1 text-sm">Save note</button>
          </div>
        </div>
      </Sheet>
      </div>

      {showUndo && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm">
          <span>Exercise finished</span>
          <button type="button" onClick={handleUndoComplete} className="min-h-11 border-0 bg-transparent px-3 font-bold text-[var(--accent)]">UNDO</button>
        </div>
      )}
    </div>
  )
}
