'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { deleteWorkoutLog, getWorkoutLogs, updateWorkoutLog } from '@/lib/firebaseQueries'
import { formatUKDate } from '@/lib/chartUtils'

const formatDuration = (durationMs) => {
  const totalMinutes = Math.floor(Math.max(0, durationMs || 0) / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function WorkoutLogCard({ log, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftExercises, setDraftExercises] = useState(log.exercises || [])
  const [isSaving, setIsSaving] = useState(false)

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    setDraftExercises(previous => previous.map((exercise, currentExerciseIndex) => (
      currentExerciseIndex !== exerciseIndex
        ? exercise
        : {
            ...exercise,
            sets: exercise.sets.map((set, currentSetIndex) => (
              currentSetIndex !== setIndex ? set : { ...set, [field]: value }
            )),
          }
    )))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(log.id, { exercises: draftExercises })
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{log.dayName}</h2>
          <p className="mt-1 text-sm text-slate-500">{formatUKDate(log.startedAt)}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>{formatDuration(log.durationMs)}</div>
          <div>{log.exercises?.length || 0} exercises</div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {draftExercises.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm italic text-slate-500">No completed exercise data was recorded.</p>
        ) : (
          draftExercises.map((exercise, exerciseIndex) => (
            <div key={`${log.id}-${exercise.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="font-semibold text-slate-800">{exercise.name}</h3>
              <div className="mt-2 flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={`${exercise.id}-${set.setNumber}`} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-sm">
                    <span className="text-slate-500">Set {set.setNumber}</span>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(event) => handleSetChange(exerciseIndex, setIndex, 'weight', event.target.value)}
                          className="min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-800"
                          aria-label={`${exercise.name} set ${set.setNumber} weight`}
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(event) => handleSetChange(exerciseIndex, setIndex, 'reps', event.target.value)}
                          className="min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-800"
                          aria-label={`${exercise.name} set ${set.setNumber} reps`}
                        />
                      </>
                    ) : (
                      <>
                        <span className="rounded-lg bg-white px-2 py-2 text-slate-700">{set.weight}kg</span>
                        <span className="rounded-lg bg-white px-2 py-2 text-slate-700">{set.reps} reps</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {isEditing ? (
          <>
            <button type="button" onClick={() => { setDraftExercises(log.exercises || []); setIsEditing(false) }} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
            Edit Data
          </button>
        )}
        <button type="button" onClick={() => onDelete(log.id)} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
          Delete
        </button>
      </div>
    </article>
  )
}

export default function DataPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    getWorkoutLogs(user.uid)
      .then(setLogs)
      .catch(error => console.error('Error loading workout logs:', error))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const handleSave = async (logId, updates) => {
    await updateWorkoutLog(user.uid, logId, updates)
    setLogs(previous => previous.map(log => log.id === logId ? { ...log, ...updates } : log))
  }

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this workout data?')) return
    await deleteWorkoutLog(user.uid, logId)
    setLogs(previous => previous.filter(log => log.id !== logId))
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading...</div>
  }

  if (!user) return null

  return (
    <>
      <nav className="mb-5 flex items-center gap-2 overflow-x-auto bg-panel px-5 py-4 shadow-soft sm:gap-5">
        <Link href="/" className="nav-link">Workouts</Link>
        <Link href="/metrics" className="nav-link">Body Metrics</Link>
        <Link href="/data" className="nav-link active">Data</Link>
        <Link href="/stats" className="nav-link">Stats</Link>
        <button onClick={handleLogout} className="ml-auto shrink-0 cursor-pointer border-none bg-transparent text-sm font-medium text-slate-700">
          Logout
        </button>
      </nav>

      <main className="py-5">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Workout Data</h1>
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
              Completed workout data will appear here.
            </div>
          ) : (
            logs.map(log => (
              <WorkoutLogCard key={log.id} log={log} onSave={handleSave} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>
    </>
  )
}
