'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { deleteWorkoutLog, getWorkoutLogs, updateWorkoutLog } from '@/lib/firebaseQueries'
import { formatUKDate } from '@/lib/chartUtils'
import AppNav from '@/components/AppNav'
import Sheet from '@/components/Sheet'

const formatDuration = ms => { const total = Math.floor(Math.max(0, ms || 0) / 60000); return total >= 60 ? `${Math.floor(total / 60)}h ${total % 60}m` : `${total}m` }
const volume = log => (log.exercises || []).reduce((total, exercise) => total + (exercise.sets || []).reduce((sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0), 0)

function LogCard({ log, onSave, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updateValue = async (exerciseIndex, setIndex, field, value) => {
    const exercises = (log.exercises || []).map((exercise, index) => index !== exerciseIndex ? exercise : { ...exercise, sets: exercise.sets.map((set, current) => current !== setIndex ? set : { ...set, [field]: value }) })
    await onSave(log.id, { exercises })
    setEditing(null)
  }
  return <article className="border-b-2 border-[var(--divider)]"><button type="button" onClick={() => setExpanded(!expanded)} className="grid min-h-16 w-full grid-cols-[1fr_auto_auto] items-center gap-3 text-left"><span><strong className="block text-[var(--ink)]">{log.dayName}</strong><span className="text-sm text-[var(--n-600)]">{formatUKDate(log.startedAt)}</span></span><span className="text-right text-xs uppercase text-[var(--n-600)]">{formatDuration(log.durationMs)}<br />{Math.round(volume(log))}kg volume</span><span className="text-[var(--accent)]">{expanded ? '−' : '+'}</span></button>{expanded && <div className="border-t border-[var(--hairline)] py-3">{(log.exercises || []).map((exercise, exerciseIndex) => <div key={exercise.id} className="border-b border-[var(--hairline)] py-3"><h3 className="font-bold">{exercise.name}</h3>{exercise.sets.map((set, setIndex) => <div key={set.setNumber} className="grid grid-cols-[4rem_1fr_1fr] gap-2 py-1 text-sm"><span className="text-[var(--n-600)]">Set {set.setNumber}</span>{['weight', 'reps'].map(field => editing?.exerciseIndex === exerciseIndex && editing?.setIndex === setIndex && editing.field === field ? <input key={field} autoFocus type="text" inputMode="decimal" value={draft} onChange={event => setDraft(event.target.value)} onBlur={() => updateValue(exerciseIndex, setIndex, field, draft)} className="min-h-11 border-2 border-[var(--accent)] bg-transparent px-2" /> : <button key={field} type="button" onClick={() => { setEditing({ exerciseIndex, setIndex, field }); setDraft(set[field]) }} className="min-h-11 border-b border-[var(--hairline)] text-left num">{set[field]}{field === 'weight' ? 'kg' : ' reps'}</button>)}</div>)}</div>)}<button type="button" onClick={() => setDeleteOpen(true)} className="mt-3 min-h-11 text-sm font-bold text-[var(--accent)]">DELETE LOG</button><Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete workout log?"><p className="text-sm text-[var(--n-600)]">This removes this session from your raw data history.</p><button type="button" onClick={() => { onDelete(log.id); setDeleteOpen(false) }} className="mt-5 min-h-11 w-full bg-[var(--accent)] font-bold text-white">DELETE</button></Sheet></div>}</article>
}

export default function DataPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 20
  useEffect(() => { if (authLoading) return; if (!user) { router.push('/login'); return } getWorkoutLogs(user.uid, pageSize).then(data => { setLogs(data); setHasMore(data.length === pageSize) }).catch(error => setLoadError(error?.code || error?.message || 'Unable to load workout logs.')).finally(() => setLoading(false)) }, [user, authLoading, router])
  const groupedLogs = useMemo(() => logs.reduce((groups, log) => { const key = new Date(log.startedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase(); (groups[key] ||= []).push(log); return groups }, {}), [logs])
  const save = async (id, updates) => { await updateWorkoutLog(user.uid, id, updates); setLogs(previous => previous.map(log => log.id === id ? { ...log, ...updates } : log)) }
  const remove = async id => { await deleteWorkoutLog(user.uid, id); setLogs(previous => previous.filter(log => log.id !== id)) }
  const loadMore = async () => { const next = await getWorkoutLogs(user.uid, pageSize, logs.at(-1)?.startedAt); setLogs(previous => [...previous, ...next]); setHasMore(next.length === pageSize) }
  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading data...</div>
  if (!user) return null
  return <><AppNav /><main><h1 className="mb-6 text-3xl text-[var(--ink)]">Workout Data</h1>{loadError && <p className="text-[var(--accent-700)]">{loadError}</p>}{logs.length === 0 ? <div className="border-y border-[var(--hairline)] py-6"><p className="font-bold">No workout logs yet</p><p className="mt-1 text-sm text-[var(--n-600)]">Completed sessions will appear here.</p></div> : Object.entries(groupedLogs).map(([month, monthLogs]) => <section key={month} className="mb-6"><h2 className="sticky top-0 border-b-2 border-[var(--divider)] bg-[var(--bg)] py-2 text-xs font-bold tracking-[0.12em]">{month}</h2>{monthLogs.map(log => <LogCard key={log.id} log={log} onSave={save} onDelete={remove} />)}</section>)}{hasMore && <button type="button" onClick={loadMore} className="min-h-11 w-full border-2 border-[var(--divider)] font-bold text-[var(--ink)]">LOAD MORE</button>}</main></>
}
