'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useWorkoutSession } from '@/lib/workoutSessionContext'
import { getWorkoutDays, saveWorkoutDays, saveWorkoutLog } from '@/lib/firebaseQueries'
import WorkoutDay from '@/components/WorkoutDay'
import WorkoutTimer from '@/components/WorkoutTimer'
import AddExerciseSheet from '@/components/library/AddExerciseSheet'
import { Ellipsis, Pencil, Plus, StickyNote } from 'lucide-react'
import { useNavTitle } from '@/components/NavShell'
import PopoverMenu from '@/components/PopoverMenu'
import NoteSheet from '@/components/NoteSheet'
import FinishWorkoutSheet from '@/components/FinishWorkoutSheet'
import { buildLogExercises, countSets, summarizeSession } from '@/lib/sessionMath'

export default function SessionPage() {
  const { user, loading: authLoading } = useAuth()
  const { session, endSession } = useWorkoutSession()
  const router = useRouter()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
    }

    getWorkoutDays(user.uid)
      .then(data => setDays(data.map(day => ({ ...day, isCollapsed: false, isStarted: Boolean(day.isStarted) }))))
      .catch(error => console.error('Error loading session:', error))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  useEffect(() => {
    if (!loading && user && days.length) saveWorkoutDays(user.uid, days)
  }, [days, loading, user])

  const activeDay = days.find(day => day.isStarted || day.id === session?.dayId)
  useNavTitle(activeDay?.name)

  const handleDayNameChange = (id, newName) => {
    setDays(previous => previous.map(day => day.id === id ? { ...day, name: newName } : day))
  }

  const handleSaveName = () => {
    if (activeDay) handleDayNameChange(activeDay.id, editedName)
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  const handleConfirmAddExercise = (entry) => {
    if (!activeDay) return
    setDays(previous => previous.map(day => day.id === activeDay.id ? { ...day, exercises: [...day.exercises, entry] } : day))
  }

  const updateExercise = (dayId, exerciseId, updatedExercise) => {
    setDays(previous => previous.map(day => day.id === dayId
      ? { ...day, exercises: day.exercises.map(exercise => exercise.id === exerciseId ? updatedExercise : exercise) }
      : day
    ))
  }

  const reorderExercises = (dayId, fromId, toId) => setDays(previous => previous.map(day => { if (day.id !== dayId) return day; const from = day.exercises.findIndex(ex => String(ex.id) === String(fromId)); const to = day.exercises.findIndex(ex => String(ex.id) === String(toId)); if (from < 0 || to < 0 || from === to) return day; const exercises = [...day.exercises]; const [moved] = exercises.splice(from, 1); exercises.splice(to, 0, moved); return { ...day, exercises } }))

  const removeExercise = (dayId, exerciseId) => {
    setDays(previous => previous.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(exercise => exercise.id !== exerciseId) } : day))
  }

  const handleDayNoteChange = (id, note) => setDays(previous => previous.map(day => day.id === id ? { ...day, note } : day))
  const setExercises = (dayId, updater) => setDays(previous => previous.map(day => day.id === dayId ? { ...day, exercises: updater(day.exercises) } : day))

  const handleEndSession = async (notes = '') => {
    if (!activeDay || !session?.startedAt) {
      router.push('/')
      return
    }
    setFinishing(true)

    const finalSession = await endSession()
    const activeSessionId = finalSession.sessionId ?? finalSession.startedAt
    const loggedExercises = buildLogExercises(activeDay, activeSessionId, finalSession.endedAt)

    await saveWorkoutLog(user.uid, {
      dayId: activeDay.id,
      dayName: activeDay.name,
      startedAt: finalSession.startedAt,
      endedAt: finalSession.endedAt,
      durationMs: finalSession.durationMs,
      sessionId: activeSessionId,
      exercises: loggedExercises,
      ...(notes ? { notes } : {}),
      ...(activeDay.note ? { dayNote: activeDay.note } : {}),
    })

    setDays(previous => previous.map(day => day.id === activeDay.id
      ? { ...day, isStarted: false, exercises: day.exercises.map(exercise => ({ ...exercise, isStarted: false })) }
      : day
    ))
    router.push('/')
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading session...</div>
  if (!user) return null
  if (!activeDay) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">No active session.</div>

  const activeSessionId = session.sessionId ?? session.startedAt
  const progress = countSets(activeDay, activeSessionId)
  const summary = finishOpen ? summarizeSession(activeDay, activeSessionId, Date.now() - session.startedAt) : null

  return (
    <>
      <main className="p-0">
        <header className="sticky top-2 z-30 mx-3 mt-2 rounded-3xl glass-card px-4 py-3">
          {isEditingName ? (
            <input
              className="session-day-name w-full rounded-xl border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-1.5 text-xl text-[var(--ink)] outline-none"
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="num text-2xl leading-none text-[var(--ink)]"><WorkoutTimer session={session} compact /></p>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--n-600)]">{progress.logged}/{progress.total} sets logged</p>
              </div>
              <button type="button" onClick={() => setFinishOpen(true)} className="glass-pill h-10 px-5 text-sm">Finish</button>
              <PopoverMenu ariaLabel="Workout options" items={[
                { label: 'Rename workout', icon: Pencil, onSelect: () => { setEditedName(activeDay.name); setIsEditingName(true) } },
                { label: activeDay.note ? 'Edit note' : 'Add note', icon: StickyNote, onSelect: () => setNoteOpen(true) },
                { label: 'Add exercise', icon: Plus, onSelect: () => setAddExerciseOpen(true) },
              ]}><Ellipsis size={18} /></PopoverMenu>
            </div>
          )}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[var(--accent)] transition-all duration-500" style={{ width: `${progress.total ? Math.round((progress.logged / progress.total) * 100) : 0}%` }} /></div>
        </header>
        {activeDay.note && <button type="button" onClick={() => setNoteOpen(true)} className="mx-3 mt-3 flex w-[calc(100%-1.5rem)] items-start gap-2 rounded-2xl border-0 bg-amber-400/15 px-4 py-3 text-left text-sm text-[var(--ink)]"><StickyNote size={15} className="mt-0.5 shrink-0 text-amber-600" /><span className="min-w-0 whitespace-pre-wrap break-words">{activeDay.note}</span></button>}
        <WorkoutDay
          day={activeDay}
          onDayNameChange={handleDayNameChange}
          onToggleCollapse={() => {}}
          onToggleDayStart={(_, started) => { if (!started) handleEndSession() }}
          onRemoveDay={() => {}}
          onAddExercise={() => setAddExerciseOpen(true)}
          onRemoveExercise={removeExercise} onReorderExercises={reorderExercises}
          onUpdateExercise={(dayId, exerciseId, updated) => updateExercise(dayId, exerciseId, updated)}
          onSetExercises={setExercises}
          onDayNoteChange={handleDayNoteChange}
          sessionMode
          sessionId={session.sessionId ?? session.startedAt}
        />
      </main>
      <NoteSheet open={noteOpen} onClose={() => setNoteOpen(false)} title={`Note · ${activeDay.name}`} value={activeDay.note || ''} onSave={note => handleDayNoteChange(activeDay.id, note)} />
      <FinishWorkoutSheet open={finishOpen} onClose={() => setFinishOpen(false)} onFinish={handleEndSession} finishing={finishing} startedAt={session.startedAt} summary={summary} />
      <AddExerciseSheet open={addExerciseOpen} onClose={() => setAddExerciseOpen(false)} dayName={activeDay.name} onAdd={handleConfirmAddExercise} />
    </>
  )
}
