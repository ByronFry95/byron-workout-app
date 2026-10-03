import { resolveLibraryExercise } from '@/lib/exerciseLibrary'

const num = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const estimateOneRepMax = (weight, reps) => {
  const w = num(weight)
  const r = num(reps)
  if (w <= 0 || r <= 0) return 0
  return w * (1 + r / 30)
}

export const isSetLoggedThisSession = (set, side, sessionId) => {
  const stamp = side === 'right' ? set.loggedAtRight : set.loggedAt
  if (!stamp) return false
  return sessionId == null || set.loggedSessionId === sessionId
}

// Rolls the current values into "last session" and clears this session's logging state.
export function startExerciseState(exercise, unilateral = false) {
  const sets = exercise.sets.map(set => {
    const next = {
      ...set,
      previousWeight: set.currentWeight || set.previousWeight,
      previousReps: set.currentReps || set.previousReps,
      currentWeight: set.currentWeight || set.previousWeight || '',
      currentReps: set.currentReps || set.previousReps || '',
      loggedAt: null,
      loggedAtRight: null,
      loggedSessionId: null,
    }
    if (unilateral || set.currentWeightRight || set.previousWeightRight) {
      next.previousWeightRight = set.currentWeightRight || set.previousWeightRight || next.previousWeight
      next.previousRepsRight = set.currentRepsRight || set.previousRepsRight || next.previousReps
      next.currentWeightRight = set.currentWeightRight || set.previousWeightRight || next.currentWeight
      next.currentRepsRight = set.currentRepsRight || set.previousRepsRight || next.currentReps
    }
    return next
  })
  return { ...exercise, sets, isStarted: true, isCompleted: false, isCollapsed: false }
}

export function completeExerciseState(exercise) {
  return { ...exercise, isStarted: false, isCompleted: true, completedAt: new Date().toISOString(), isCollapsed: true }
}

export function bestPreviousOneRepMax(exercise) {
  return exercise.sets.reduce((best, set) => Math.max(
    best,
    estimateOneRepMax(set.previousWeight, set.previousReps),
    estimateOneRepMax(set.previousWeightRight, set.previousRepsRight),
  ), 0)
}

export function summarizeSession(day, sessionId, durationMs) {
  const perMuscle = new Map()
  let totalVolume = 0
  let setsLogged = 0
  let exercisesLogged = 0

  for (const exercise of day.exercises) {
    const muscle = resolveLibraryExercise(exercise)?.bodyPart || 'Other'
    let exerciseVolume = 0
    let exerciseSets = 0
    for (const set of exercise.sets) {
      if (isSetLoggedThisSession(set, 'left', sessionId)) {
        exerciseVolume += num(set.currentWeight) * num(set.currentReps)
        exerciseSets += 1
      }
      if (isSetLoggedThisSession(set, 'right', sessionId)) {
        exerciseVolume += num(set.currentWeightRight) * num(set.currentRepsRight)
        exerciseSets += 1
      }
    }
    if (exerciseSets === 0) continue
    exercisesLogged += 1
    setsLogged += exerciseSets
    totalVolume += exerciseVolume
    const entry = perMuscle.get(muscle) || { volume: 0, sets: 0 }
    perMuscle.set(muscle, { volume: entry.volume + exerciseVolume, sets: entry.sets + exerciseSets })
  }

  const muscles = [...perMuscle.entries()]
    .map(([muscle, entry]) => ({ muscle, ...entry }))
    .sort((left, right) => right.volume - left.volume || right.sets - left.sets)

  return { totalVolume, setsLogged, exercisesLogged, muscles, topMuscle: muscles[0]?.muscle || null, durationMs }
}

export function countSets(day, sessionId) {
  let total = 0
  let logged = 0
  for (const exercise of day.exercises) {
    const sides = exercise.unilateral ? ['left', 'right'] : ['left']
    for (const set of exercise.sets) {
      for (const side of sides) {
        total += 1
        if (isSetLoggedThisSession(set, side, sessionId)) logged += 1
      }
    }
  }
  return { total, logged }
}

export function buildLogExercises(day, sessionId, fallbackEndedAt) {
  const filled = (weight, reps) => weight !== '' && weight != null && reps !== '' && reps != null
  return day.exercises
    .map(exercise => {
      const sets = exercise.sets
        .map(set => {
          const left = isSetLoggedThisSession(set, 'left', sessionId) && filled(set.currentWeight, set.currentReps)
          const right = isSetLoggedThisSession(set, 'right', sessionId) && filled(set.currentWeightRight, set.currentRepsRight)
          if (!left && !right) return null
          const entry = left
            ? { setNumber: set.setNumber, weight: set.currentWeight, reps: set.currentReps, loggedAt: set.loggedAt }
            : { setNumber: set.setNumber, weight: set.currentWeightRight, reps: set.currentRepsRight, loggedAt: set.loggedAtRight, side: 'right' }
          if (left && right) {
            entry.rightWeight = set.currentWeightRight
            entry.rightReps = set.currentRepsRight
          }
          return entry
        })
        .filter(Boolean)
      return {
        id: exercise.id,
        name: exercise.name,
        libraryId: exercise.libraryId || null,
        note: exercise.note || '',
        completedAt: exercise.completedAt || fallbackEndedAt,
        sets,
      }
    })
    .filter(exercise => exercise.sets.length > 0)
}
