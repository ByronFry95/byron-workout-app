'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getMetricsHistory, getWorkoutDays, getWorkoutLogs } from '@/lib/firebaseQueries'
import { CHART_PALETTE, TIMEFRAMES, filterPointsByTimeframe, resolveExerciseColors } from '@/lib/chartUtils'
import TrendLineChart from '@/components/TrendLineChart'
import AppNav from '@/components/AppNav'
import { X } from 'lucide-react'
import StatTiles from '@/components/StatTiles'
import Segmented from '@/components/Segmented'

const MAX_SELECTED_EXERCISES = 5

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth()
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
      getWorkoutLogs(user.uid, 400),
    ])
      .then(([metrics, days, logs]) => {
        setMetricsHistory(metrics)
        setWorkoutDays(days)
        setWorkoutLogs(logs)
        const newestExercise = logs[0]?.exercises?.[0]
        if (newestExercise) setSelectedExercises([{ id: newestExercise.id, name: newestExercise.name, dayName: logs[0].dayName, baseColor: CHART_PALETTE[0], hasHistory: true }])
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
        const bestSet = (exercise.sets || []).map(set => ({ weight: Number(set.weight), reps: Number(set.reps) })).filter(set => Number.isFinite(set.weight) && set.weight > 0).sort((a, b) => b.weight - a.weight)[0]
        if (!bestSet) return

        const x = new Date(exercise.completedAt || log.startedAt).getTime()
        if (!Number.isFinite(x)) return

        const list = map.get(exercise.id) || []
        list.push({ x, y: bestSet.weight, reps: bestSet.reps })
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

  const bodyWeightPoints = metricsSeries.find(series => series.id === 'weight')?.points || []
  const bodyWeightChange = bodyWeightPoints.length > 1 ? bodyWeightPoints.at(-1).y - bodyWeightPoints[0].y : null

  const resolvedSelected = resolveExerciseColors(selectedExercises)

  const strengthSeries = resolvedSelected.map(exercise => ({
    id: exercise.id,
    color: exercise.color,
    label: `${exercise.name} (${exercise.dayName})`,
    points: filterPointsByTimeframe(exerciseHistoryById.get(exercise.id) || [], timeframe),
    formatValue: (v) => `${v}kg`,
    dash: resolvedSelected.findIndex(item => item.id === exercise.id) % 2 === 1 ? '6 4' : undefined,
  }))

  const activeStrengthPoint = resolvedSelected[0] ? filterPointsByTimeframe(exerciseHistoryById.get(resolvedSelected[0].id) || [], timeframe) : []
  const topSet = activeStrengthPoint.length ? Math.max(...activeStrengthPoint.map(point => point.y)) : null
  const firstSet = activeStrengthPoint[0]?.y
  const latestSet = activeStrengthPoint[activeStrengthPoint.length - 1]?.y
  const change = firstSet !== undefined && latestSet !== undefined ? latestSet - firstSet : null
  const bestStrengthSet = [...activeStrengthPoint].sort((a, b) => b.y - a.y)[0]
  const bestSetReps = bestStrengthSet?.reps || 0
  const estimatedOneRepMax = topSet && bestSetReps ? topSet * (1 + bestSetReps / 30) : null

  const toggleExercise = (exercise) => {
    setSelectedExercises(previous => {
      const isSelected = previous.some(item => item.id === exercise.id)
      if (isSelected) return previous.filter(item => item.id !== exercise.id)
      if (previous.length >= MAX_SELECTED_EXERCISES) return previous
      return [...previous, exercise]
    })
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

      <main>
        <h1 className="mb-4 text-3xl font-bold text-slate-800">Stats</h1>

        <div className="mb-4"><Segmented options={[{ value: 'body', label: 'Body' }, { value: 'strength', label: 'Strength' }]} value={view} onChange={setView} columns={2} /></div>

        <div className="mb-6"><Segmented options={TIMEFRAMES.map(preset => ({ value: preset.key, label: preset.label }))} value={timeframe} onChange={setTimeframe} columns={TIMEFRAMES.length} /></div>

        {view === 'body' ? <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Body Composition Trend</h2>
          <StatTiles tiles={[{ label: 'Weight now', value: metricsHistory[0]?.weight ? `${metricsHistory[0].weight}kg` : '--' }, { label: `${timeframe} change`, value: bodyWeightChange === null ? '--' : `${bodyWeightChange > 0 ? '+' : ''}${bodyWeightChange.toFixed(1)}kg` }, { label: 'Body fat now', value: metricsHistory[0]?.bodyFat ? `${metricsHistory[0].bodyFat}%` : '--' }]} />
          <TrendLineChart series={metricsSeries} height={170} emptyMessage="Log body metrics to see your trend here." />
        </section> : <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Strength Trend</h2>
          <div className="mb-3 grid grid-cols-3 gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">
            {[
              [`${resolvedSelected[0]?.name || 'Exercise'} top set`, topSet ? `${topSet}kg` : '--'],
              [`${resolvedSelected[0]?.name || 'Exercise'} change`, change === null ? '--' : `${change > 0 ? '+' : ''}${change}kg`],
              [`${resolvedSelected[0]?.name || 'Exercise'} est. 1RM`, estimatedOneRepMax ? `${estimatedOneRepMax.toFixed(1)}kg` : '--'],
            ].map(([label, value]) => <div key={label} className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">{label}</p><p className="num mt-1 text-lg">{value}</p></div>)}
          </div>
          <div className="mb-3 flex gap-2"><button type="button" onClick={() => setPickerOpen(true)} className="min-h-11 flex-1 border-2 border-[var(--divider)] bg-[var(--surface)] px-3 text-left font-bold">{resolvedSelected.length ? `${resolvedSelected.length} exercises selected` : 'Choose exercises'}</button></div>
          <div className="mb-3 flex flex-wrap gap-2">{resolvedSelected.map(exercise => <button key={exercise.id} type="button" onClick={() => toggleExercise(exercise)} className="flex min-h-11 items-center gap-2 border-2 border-[var(--divider)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--ink)]"><span className="h-0.5 w-4" style={{ backgroundColor: exercise.color }} />{exercise.name}<X size={14} /></button>)}</div>
          <TrendLineChart series={strengthSeries} height={170} emptyMessage="Choose an exercise to plot its trend." />
        </section>}

        {view === 'strength' && pickerOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setPickerOpen(false)}><div className="max-h-[80vh] w-full overflow-y-auto border-t-2 border-[var(--divider)] bg-[var(--surface)] p-5" onClick={event => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-12 bg-[var(--n-500)]" /><h2 className="mb-4 text-xl">Choose exercises</h2><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{dayColumns.flatMap(day => day.exercises).map(exercise => { const selected = selectedExercises.some(item => item.id === exercise.id); return <button key={exercise.id} type="button" disabled={!exercise.hasHistory} onClick={() => toggleExercise(exercise)} className={`min-h-11 border-2 px-3 text-left text-sm font-bold disabled:opacity-40 ${selected ? 'border-[var(--accent)] bg-[var(--accent-100)]' : 'border-[var(--hairline)] bg-transparent'}`}>{exercise.name}</button> })}</div><button type="button" onClick={() => setPickerOpen(false)} className="mt-5 min-h-11 w-full bg-[var(--ink)] font-bold text-white">DONE</button></div></div>}

      </main>
    </>
  )
}
