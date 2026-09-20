'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getMetricsHistory, getWorkoutDays, getWorkoutLogs } from '@/lib/firebaseQueries'
import { CHART_PALETTE, TIMEFRAMES, filterPointsByTimeframe, resolveExerciseColors } from '@/lib/chartUtils'
import TrendLineChart from '@/components/TrendLineChart'
import AppNav from '@/components/AppNav'
import { X } from 'lucide-react'

const MAX_SELECTED_EXERCISES = 5

export default function StatsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [metricsHistory, setMetricsHistory] = useState([])
  const [workoutDays, setWorkoutDays] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [timeframe, setTimeframe] = useState('3m')
  const [view, setView] = useState('body')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    Promise.all([
      getMetricsHistory(user.uid),
      getWorkoutDays(user.uid),
      getWorkoutLogs(user.uid),
    ])
      .then(([metrics, days, logs]) => {
        setMetricsHistory(metrics)
        setWorkoutDays(days)
        setWorkoutLogs(logs)
      })
      .catch(error => {
        console.error('Error loading stats data:', error)
        setLoadError(error?.code || error?.message || 'Unable to load stats from Firebase.')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const exerciseHistoryById = useMemo(() => {
    const map = new Map()

    workoutLogs.forEach(log => {
      (log.exercises || []).forEach(exercise => {
        const weights = (exercise.sets || [])
          .map(set => Number(set.weight))
          .filter(value => Number.isFinite(value) && value > 0)

        if (weights.length === 0) return

        const x = new Date(exercise.completedAt || log.startedAt).getTime()
        if (!Number.isFinite(x)) return

        const list = map.get(exercise.id) || []
        list.push({ x, y: Math.max(...weights) })
        map.set(exercise.id, list)
      })
    })

    map.forEach(list => list.sort((a, b) => a.x - b.x))
    return map
  }, [workoutLogs])

  const dayColumns = useMemo(() => {
    let flatIndex = 0

    return workoutDays.map(day => ({
      id: day.id,
      name: day.name,
      exercises: (day.exercises || []).map(exercise => {
        const baseColor = CHART_PALETTE[flatIndex % CHART_PALETTE.length]
        flatIndex += 1

        return {
          id: exercise.id,
          name: exercise.name,
          dayName: day.name,
          baseColor,
          hasHistory: (exerciseHistoryById.get(exercise.id) || []).length > 0,
        }
      }),
    }))
  }, [workoutDays, exerciseHistoryById])

  const metricsSeries = useMemo(() => {
    const weight = []
    const waist = []

    metricsHistory.forEach(entry => {
      const x = new Date(entry.date || entry.timestamp).getTime()
      if (!Number.isFinite(x)) return
      if (entry.weight) weight.push({ x, y: Number(entry.weight) })
      if (entry.waist) waist.push({ x, y: Number(entry.waist) })
    })

    weight.sort((a, b) => a.x - b.x)
    waist.sort((a, b) => a.x - b.x)

    return [
      { id: 'weight', color: CHART_PALETTE[4], label: 'Weight', points: filterPointsByTimeframe(weight, timeframe), formatValue: (v) => `${v}kg` },
      { id: 'waist', color: CHART_PALETTE[0], label: 'Waist', points: filterPointsByTimeframe(waist, timeframe), formatValue: (v) => `${v}cm` },
    ]
  }, [metricsHistory, timeframe])

  const resolvedSelected = resolveExerciseColors(selectedExercises)

  const strengthSeries = resolvedSelected.map(exercise => ({
    id: exercise.id,
    color: exercise.color,
    label: `${exercise.name} (${exercise.dayName})`,
    points: filterPointsByTimeframe(exerciseHistoryById.get(exercise.id) || [], timeframe),
    formatValue: (v) => `${v}kg`,
    dash: resolvedSelected.findIndex(item => item.id === exercise.id) % 2 === 1 ? '6 4' : undefined,
  }))

  const activeStrengthPoint = resolvedSelected[0] ? (exerciseHistoryById.get(resolvedSelected[0].id) || []).filter(point => point.x >= (Date.now() - (TIMEFRAMES.find(item => item.key === timeframe)?.days || 36500) * 86400000)) : []
  const topSet = activeStrengthPoint.length ? Math.max(...activeStrengthPoint.map(point => point.y)) : null
  const firstSet = activeStrengthPoint[0]?.y
  const latestSet = activeStrengthPoint[activeStrengthPoint.length - 1]?.y
  const change = firstSet !== undefined && latestSet !== undefined ? latestSet - firstSet : null
  const latestReps = resolvedSelected[0] ? Number((workoutLogs.flatMap(log => log.exercises || []).find(item => item.id === resolvedSelected[0].id)?.sets?.at(-1)?.reps || 0)) : 0
  const estimatedOneRepMax = topSet && latestReps ? topSet * (1 + latestReps / 30) : null

  const toggleExercise = (exercise) => {
    setSelectedExercises(previous => {
      const isSelected = previous.some(item => item.id === exercise.id)
      if (isSelected) return previous.filter(item => item.id !== exercise.id)
      if (previous.length >= MAX_SELECTED_EXERCISES) return previous
      return [...previous, exercise]
    })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading...</div>
  }

  if (!user) return null

  if (loadError) {
    return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Firebase error: {loadError}</div>
  }

  return (
    <>
      <AppNav />

      <main className="py-5">
        <h1 className="mb-4 text-3xl font-bold text-slate-800">Stats</h1>

        <div className="mb-4 grid grid-cols-2 border-2 border-[var(--divider)]">
          {['body', 'strength'].map(option => (
            <button key={option} type="button" onClick={() => setView(option)} className={`min-h-11 font-bold uppercase tracking-wide ${view === option ? 'bg-[var(--accent)] text-white' : 'bg-transparent text-[var(--ink)]'}`}>
              {option === 'body' ? 'Body' : 'Strength'}
            </button>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-5 border-2 border-[var(--divider)]">
          {TIMEFRAMES.map(preset => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setTimeframe(preset.key)}
              className={`min-h-11 text-xs font-bold transition-colors ${timeframe === preset.key ? 'bg-[var(--ink)] text-white' : 'bg-transparent text-[var(--ink)] hover:bg-[var(--n-300)]'}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {view === 'body' ? <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Body Composition Trend</h2>
          <TrendLineChart series={metricsSeries} height={170} normalize emptyMessage="Log body metrics to see your trend here." />
        </section> : <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Strength Trend</h2>
          <div className="mb-3 grid grid-cols-3 gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">
            {[
              ['Top set', topSet ? `${topSet}kg` : '--'],
              ['Change', change === null ? '--' : `${change > 0 ? '+' : ''}${change}kg`],
              ['Est. 1RM', estimatedOneRepMax ? `${estimatedOneRepMax.toFixed(1)}kg` : '--'],
            ].map(([label, value]) => <div key={label} className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">{label}</p><p className="num mt-1 text-lg">{value}</p></div>)}
          </div>
          <div className="mb-3 flex gap-2"><button type="button" onClick={() => setPickerOpen(true)} className="min-h-11 flex-1 border-2 border-[var(--divider)] bg-[var(--surface)] px-3 text-left font-bold">{resolvedSelected.length ? `${resolvedSelected.length} exercises selected` : 'Choose exercises'}</button></div>
          <TrendLineChart series={strengthSeries} height={170} emptyMessage="Choose an exercise to plot its trend." />
        </section>}

        {view === 'strength' && pickerOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setPickerOpen(false)}><div className="max-h-[80vh] w-full overflow-y-auto border-t-2 border-[var(--divider)] bg-[var(--surface)] p-5" onClick={event => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-12 bg-[var(--n-500)]" /><h2 className="mb-4 text-xl">Choose exercises</h2><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{dayColumns.flatMap(day => day.exercises).map(exercise => { const selected = selectedExercises.some(item => item.id === exercise.id); return <button key={exercise.id} type="button" disabled={!exercise.hasHistory} onClick={() => toggleExercise(exercise)} className={`min-h-11 border-2 px-3 text-left text-sm font-bold disabled:opacity-40 ${selected ? 'border-[var(--accent)] bg-[var(--accent-100)]' : 'border-[var(--hairline)] bg-transparent'}`}>{exercise.name}</button> })}</div><button type="button" onClick={() => setPickerOpen(false)} className="mt-5 min-h-11 w-full bg-[var(--ink)] font-bold text-white">DONE</button></div></div>}

        <section className={view === 'body' ? 'hidden' : ''}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Strength Trend</h2>

          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
            {resolvedSelected.length === 0 ? (
              <p className="text-sm italic text-slate-400">Select up to {MAX_SELECTED_EXERCISES} exercises below to compare their trends.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {resolvedSelected.map(exercise => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => toggleExercise(exercise)}
                    className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    title="Remove from graph"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: exercise.color }} />
                    {exercise.name} <span className="text-slate-400">· {exercise.dayName}</span>
                    <X size={14} aria-hidden="true" className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}
            {selectedExercises.length >= MAX_SELECTED_EXERCISES && (
              <p className="mt-2 text-xs text-amber-600">Max {MAX_SELECTED_EXERCISES} selected — remove one to add another.</p>
            )}
          </div>

          <TrendLineChart series={strengthSeries} height={170} emptyMessage="Select an exercise below to plot its trend." />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dayColumns.map(day => (
              <div key={day.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <h3 className="mb-2 truncate text-sm font-bold text-slate-800">{day.name}</h3>
                <div className="flex flex-col gap-2">
                  {day.exercises.length === 0 ? (
                    <p className="text-xs italic text-slate-400">No exercises yet.</p>
                  ) : (
                    day.exercises.map(exercise => {
                      const isSelected = selectedExercises.some(item => item.id === exercise.id)
                      return (
                        <button
                          key={exercise.id}
                          type="button"
                          disabled={!exercise.hasHistory}
                          onClick={() => toggleExercise(exercise)}
                          title={exercise.hasHistory ? 'Toggle on strength graph' : 'No recorded sets yet'}
                          className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'bg-slate-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                          style={{ borderColor: isSelected ? exercise.baseColor : 'transparent' }}
                        >
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: exercise.baseColor }} />
                          <span className="min-w-0 flex-1 truncate text-slate-700">{exercise.name}</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
