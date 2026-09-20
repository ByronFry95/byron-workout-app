// Shared palette assigned in ROYGBIV + extended order across exercises
export const CHART_PALETTE = [
  '#ec3013',
  '#201e1d',
  '#605d5d',
  '#9b9797',
  '#ae1800',
  '#7d7979',
]

export const TIMEFRAMES = [
  { key: '1m', label: '1M', days: 30 },
  { key: '3m', label: '3M', days: 90 },
  { key: '6m', label: '6M', days: 180 },
  { key: '1y', label: '1Y', days: 365 },
  { key: 'all', label: 'All', days: null },
]

export function getTimeframeCutoff(timeframeKey) {
  const preset = TIMEFRAMES.find(t => t.key === timeframeKey) || TIMEFRAMES[TIMEFRAMES.length - 1]
  if (!preset.days) return null
  return Date.now() - preset.days * 24 * 60 * 60 * 1000
}

export function filterPointsByTimeframe(points, timeframeKey) {
  const cutoff = getTimeframeCutoff(timeframeKey)
  if (!cutoff) return points
  return points.filter(point => point.x >= cutoff)
}

// Recomputed from the current selection each time, so colors free up when an item is deselected
export function resolveExerciseColors(selectedExercises) {
  const used = new Set()
  return selectedExercises.map(exercise => {
    let color = exercise.baseColor
    if (used.has(color)) {
      const fallback = CHART_PALETTE.find(candidate => !used.has(candidate))
      color = fallback || color
    }
    used.add(color)
    return { ...exercise, color }
  })
}

export function formatUKDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`
}
