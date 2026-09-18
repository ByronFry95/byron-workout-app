'use client'

import { useRef, useState } from 'react'
import Exercise from './Exercise'

export default function WorkoutDay({
  day,
  onDayNameChange,
  onToggleCollapse,
  onToggleDayStart,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(day.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)

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
    if (event.pointerType === 'mouse' && event.button !== 0) return
    setIsDragging(true)
    dragStartX.current = event.clientX
  }

  const handlePointerMove = (event) => {
    if (!isDragging) return
    const delta = event.clientX - dragStartX.current
    if (delta < 0) {
      setDragX(Math.max(delta, -140))
    }
  }

  const handlePointerUp = () => {
    if (dragX <= -100) {
      setShowDeleteModal(true)
    }
    setIsDragging(false)
    setDragX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="panel-card relative z-10 overflow-hidden p-5 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full rounded-md border-2 border-blue-500 px-2 py-2 text-xl font-semibold text-slate-800"
              />
            ) : (
              <h2
                className="cursor-pointer rounded-md px-2 py-2 text-2xl font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                onClick={() => setIsEditingName(true)}
                title="Click to edit"
              >
                {day.name}
              </h2>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={day.isStarted ? 'rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-300' : 'rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400'}
              onClick={() => onToggleDayStart(day.id, !day.isStarted)}
            >
              {day.isStarted ? 'End Day' : 'Start Day'}
            </button>

            <button
              type="button"
              className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300"
              onClick={() => onToggleCollapse(day.id, !day.isCollapsed)}
              title={day.isCollapsed ? 'Expand day' : 'Collapse day'}
            >
              {day.isCollapsed ? 'Expand' : 'Collapse'}
            </button>

            <button
              type="button"
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
              onClick={() => setShowDeleteModal(true)}
              title="Remove day"
            >
              Remove
            </button>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${day.isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100'}`}>
          <div className="flex flex-col gap-4">
            {day.exercises.length === 0 ? (
              <p className="py-5 text-center italic text-slate-400">No exercises yet.</p>
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

        {!day.isCollapsed && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onAddExercise(day.id)}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg leading-none">＋</span>
                Add Exercise
              </span>
            </button>
          </div>
        )}
      </div>

      {dragX <= -40 && (
        <div
          className="pointer-events-none absolute inset-y-2 right-[-8px] z-0 flex items-center justify-center rounded-l-xl border border-rose-700/80 bg-rose-200/70 shadow-sm"
          style={{ width: `${Math.min(Math.abs(dragX), 110)}px` }}
        >
          <div className="flex h-8 w-8 items-start justify-center rounded-full border border-rose-700/80 bg-rose-100/80 pt-[2px] text-2xl font-bold leading-none text-rose-900">
            −
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75">
          <div className="w-[min(90vw,420px)] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Remove Day?</h3>
            <p className="mb-4 text-sm leading-6 text-slate-300">
              Are you sure you want to remove <span className="font-semibold text-white">{day.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => {
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
