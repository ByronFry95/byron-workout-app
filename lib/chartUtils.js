// Shared palette assigned in ROYGBIV + extended order across exercises
export const CHART_PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
]

export const TIMEFRAMES = [
  { key: '1w', label: '1W', days: 7 },
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
