'use client'

import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Sheet from '@/components/Sheet'
import TrendLineChart from '@/components/TrendLineChart'
import { useAuth } from '@/lib/authContext'
import { getWorkoutLogs } from '@/lib/firebaseQueries'
import { getFatigueRating, getMuscleBreakdown, isUnilateral, resolveLibraryExercise } from '@/lib/exerciseLibrary'
import { getExerciseSettings, updateExerciseSettings } from '@/lib/exerciseSettings'

const TABS = [{ id: 'instructions', label: 'Instructions' }, { id: 'info', label: 'Info' }, { id: 'history', label: 'History' }]
const RANGES = [{ id: '1W', days: 7 }, { id: '1M', days: 30 }, { id: '3M', days: 91 }, { id: '6M', days: 182 }, { id: '12M', days: 365 }, { id: 'MAX', days: null }]
const FATIGUE_COLORS = ['#22c55e', '#22c55e', '#f5b800', '#ef4444']

const SectionLabel = ({ children }) => <p className="mb-2 mt-5 px-2 text-sm font-semibold text-[var(--n-600)]">{children}</p>

function InstructionsTab({ library }) {
  if (!library?.steps?.length) {
    return <p className="py-10 text-center text-[var(--n-600)]">{library?.description || 'No instructions available for this exercise yet.'}</p>
  }
  return (
    <div className="flex flex-col gap-4 pb-4 pt-2">
      {library.description && <p className="px-1 text-sm leading-relaxed text-[var(--n-700)]">{library.description}</p>}
      {library.steps.map((step, index) => (
        <div key={step} className="grid grid-cols-[34px_1fr] items-start gap-3">
          <span className="num flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/[0.06] text-sm text-[var(--n-700)]">{index + 1}</span>
          <p className="pt-1 text-[16px] leading-snug">{step}</p>
        </div>
      ))}
    </div>
  )
}

function InfoTab({ exercise, library }) {
  const subject = library || exercise
  const [settings, setSettings] = useState({})
  useEffect(() => { setSettings(getExerciseSettings(exercise)) }, [exercise])

  const equipment = subject?.equipment || exercise?.equipment || 'Not set'
  const isDumbbell = equipment.toLowerCase().includes('dumbbell')
  const increment = settings.increment ?? (isDumbbell ? 2 : 2.5)
  const preferred = Boolean(settings.preferred)
  const muscles = getMuscleBreakdown(library)
  const fatigue = getFatigueRating(subject)

  const save = patch => setSettings(updateExerciseSettings(exercise, patch))
  const stepIncrement = delta => save({ increment: Math.max(0.5, Math.round((increment + delta) * 10) / 10) })

  return (
    <div className="pb-4">
      {muscles.length > 0 && (
        <>
          <SectionLabel>Muscles trained</SectionLabel>
          <div className="glass-card overflow-hidden">
            {muscles.map(item => (
              <div key={item.muscle} className="glass-row flex items-center justify-between px-5 py-3.5">
                <span className="text-[17px]">{item.muscle}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.role === 'Primary' ? 'bg-[var(--accent-100)] text-[var(--accent-700)]' : 'bg-black/[0.06] text-[var(--n-700)]'}`}>{item.role}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel>Exercise settings</SectionLabel>
      <div className="glass-card flex items-center justify-between px-5 py-3">
        <span className="text-[17px]">Increment</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => stepIncrement(-0.5)} className="glass-icon-button !h-9 !w-9" aria-label="Decrease increment"><Minus size={16} /></button>
          <span className="num min-w-14 text-center text-lg">{increment} kg</span>
          <button type="button" onClick={() => stepIncrement(0.5)} className="glass-icon-button !h-9 !w-9" aria-label="Increase increment"><Plus size={16} /></button>
        </div>
      </div>

      <div className="glass-card mt-3 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[17px] font-bold">Exercise priority</span>
          <button
            type="button"
            role="switch"
            aria-checked={preferred}
            onClick={() => save({ preferred: !preferred })}
            className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${preferred ? 'border-green-500/40 bg-green-500/10 text-green-700' : 'border-[var(--hairline)] text-[var(--n-600)]'}`}
          >
            {preferred ? 'Preferred exercise' : 'Standard'}
            <span className={`h-2.5 w-2.5 rounded-full ${preferred ? 'bg-green-500' : 'bg-[var(--n-500)]'}`} />
          </button>
        </div>
        <p className="mt-2 text-sm text-[var(--n-600)]">Preferred exercises are ranked first when suggesting replacements.</p>
      </div>

      <SectionLabel>Exercise details</SectionLabel>
      <div className="glass-card overflow-hidden">
        {[['Equipment', equipment], ['Unilateral', isUnilateral(subject) ? 'Yes' : 'No'], ['Category', subject?.category], ['Level', subject?.level]].filter(([, value]) => value).map(([label, value]) => (
          <div key={label} className="glass-row px-5 py-3.5">
            <p className="text-[17px]">{label}</p>
            <p className="text-[15px] text-[var(--n-600)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card mt-4 px-5 py-4">
        <p className="text-[17px] font-bold">Fatigue rating</p>
        <p className="mt-1 text-[15px]">{fatigue.label} <span className="text-[var(--n-600)]">- {fatigue.detail}</span></p>
        <div className="mt-3 flex items-center gap-2">
          {[1, 2, 3, 4].map(dot => <span key={dot} className="h-5 w-5 rounded-full" style={{ background: dot <= fatigue.score ? FATIGUE_COLORS[fatigue.score - 1] : 'rgba(32,30,29,0.12)' }} />)}
          <span className="num ml-auto text-lg" style={{ color: FATIGUE_COLORS[fatigue.score - 1] }}>{fatigue.score}/4</span>
        </div>
      </div>
    </div>
  )
}

function HistoryTab({ exercise, library }) {
  const { user } = useAuth()
  const [logs, setLogs] = useState(null)
  const [range, setRange] = useState('MAX')

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    getWorkoutLogs(user.uid, 400).then(data => { if (!cancelled) setLogs(data) }).catch(() => { if (!cancelled) setLogs([]) })
    return () => { cancelled = true }
  }, [user])

  const sessions = useMemo(() => {
    const names = new Set([exercise?.name, library?.name].filter(Boolean))
    const ids = new Set([exercise?.libraryId, library?.id].filter(Boolean))
    return (logs || []).flatMap(log => (log.exercises || [])
      .filter(entry => ids.has(entry.libraryId) || names.has(entry.name))
      .map(entry => {
        const sets = (entry.sets || []).map(set => ({ weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 }))
        return { id: `${log.id}-${entry.id}`, at: new Date(log.startedAt).getTime(), sets, top: Math.max(0, ...sets.map(set => set.weight)) }
      }))
      .filter(item => item.sets.length > 0)
      .sort((left, right) => left.at - right.at)
  }, [logs, exercise, library])

  const rangeDays = RANGES.find(item => item.id === range)?.days
  const visible = rangeDays ? sessions.filter(item => item.at >= Date.now() - rangeDays * 86400000) : sessions

  return (
    <div className="pb-4 pt-2">
      <div className="glass-card overflow-hidden p-2 [&>div]:rounded-2xl [&>div]:border-0 [&>div]:bg-transparent">
        <TrendLineChart series={[{ id: 'top', color: 'var(--accent)', points: visible.map(item => ({ x: item.at, y: item.top })) }]} emptyMessage={logs ? 'No data in this range' : 'Loading...'} />
      </div>
      <div className="glass-tabs mx-auto mt-5" style={{ gridTemplateColumns: `repeat(${RANGES.length}, minmax(0, 1fr))` }} role="tablist" aria-label="Range">
        {RANGES.map(item => <button key={item.id} type="button" role="tab" aria-selected={range === item.id} onClick={() => setRange(item.id)} className="glass-tab !text-xs">{item.id}</button>)}
      </div>

      <SectionLabel>Activity</SectionLabel>
      {visible.length === 0 ? (
        <p className="px-2 text-[17px] text-[var(--n-600)]">{sessions.length === 0 ? 'Exercise not yet attempted' : 'Nothing logged in this range'}</p>
      ) : (
        <div className="glass-card overflow-hidden">
          {[...visible].reverse().map(item => (
            <div key={item.id} className="glass-row px-5 py-3.5">
              <p className="text-sm font-bold">{new Date(item.at).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
              <p className="num mt-1 text-sm font-normal text-[var(--n-700)]">{item.sets.map(set => `${set.weight}kg x ${set.reps}`).join('   ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExerciseDetailSheet({ open, onClose, exercise, initialTab = 'instructions' }) {
  const [tab, setTab] = useState(initialTab)
  const library = useMemo(() => resolveLibraryExercise(exercise), [exercise])

  useEffect(() => { if (open) setTab(initialTab) }, [open, initialTab, exercise?.name])

  if (!exercise) return null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={exercise.name}
      leading={<span className="h-10 w-10 shrink-0" aria-hidden="true" />}
      trailing={<span className="h-10 w-10 shrink-0" aria-hidden="true" />}
      className="min-h-[70dvh]"
      footer={<button type="button" onClick={onClose} className="glass-pill glass-pill-light">Done</button>}
    >
      <div className="glass-tabs sticky top-0 z-10 mb-2 bg-[var(--bg)]" role="tablist" aria-label="Exercise sections" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {TABS.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className="glass-tab">{item.label}</button>)}
      </div>
      {tab === 'instructions' && <InstructionsTab library={library} />}
      {tab === 'info' && <InfoTab exercise={exercise} library={library} />}
      {tab === 'history' && <HistoryTab exercise={exercise} library={library} />}
    </Sheet>
  )
}
