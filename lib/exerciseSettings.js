// Per-exercise preferences. Stored on-device; keyed by library id, falling back to the name for custom exercises.
const STORAGE_KEY = 'exerciseSettings'

const keyFor = exercise => exercise?.libraryId || exercise?.id || exercise?.name || ''

function readAll() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function getExerciseSettings(exercise) {
  return readAll()[keyFor(exercise)] || {}
}

export function updateExerciseSettings(exercise, patch) {
  const all = readAll()
  const key = keyFor(exercise)
  all[key] = { ...all[key], ...patch }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Storage may be unavailable (private mode); settings just won't persist.
  }
  return all[key]
}

export function getPreferredKeys() {
  const all = readAll()
  return new Set(Object.keys(all).filter(key => all[key].preferred))
}
