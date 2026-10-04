export const CARDIO_ACTIVITIES = [
  { id: 'treadmill', name: 'Treadmill', unit: 'km', fields: ['distance', 'incline', 'intensity'] },
  { id: 'running', name: 'Running', unit: 'km', fields: ['distance', 'intensity'] },
  { id: 'walking', name: 'Incline Walk', unit: 'km', fields: ['distance', 'incline', 'intensity'] },
  { id: 'rowing', name: 'Rowing', unit: 'm', fields: ['distance', 'resistance', 'cadence', 'intensity'] },
  { id: 'ski', name: 'Ski Erg', unit: 'm', fields: ['distance', 'resistance', 'cadence', 'intensity'] },
  { id: 'bike', name: 'Bike', unit: 'km', fields: ['distance', 'resistance', 'cadence', 'intensity'] },
  { id: 'spin', name: 'Spinning', unit: 'km', fields: ['resistance', 'cadence', 'intensity'] },
  { id: 'assault', name: 'Assault Bike', unit: 'km', fields: ['distance', 'cadence', 'intensity'] },
  { id: 'elliptical', name: 'Cross Trainer', unit: 'km', fields: ['distance', 'resistance', 'intensity'] },
  { id: 'stairs', name: 'Stair Climber', unit: 'floors', fields: ['distance', 'resistance', 'intensity'] },
  { id: 'swimming', name: 'Swimming', unit: 'm', fields: ['distance', 'intensity'] },
  { id: 'rope', name: 'Jump Rope', unit: 'reps', fields: ['distance', 'intensity'] },
  { id: 'other', name: 'Other', unit: 'km', fields: ['distance', 'intensity'] },
]

export const CARDIO_FIELD_LABELS = {
  distance: 'Distance',
  incline: 'Incline %',
  resistance: 'Resistance',
  cadence: 'Cadence / SPM',
  intensity: 'Intensity (RPE 1-10)',
}

export const getActivity = id => CARDIO_ACTIVITIES.find(activity => activity.id === id) || CARDIO_ACTIVITIES[CARDIO_ACTIVITIES.length - 1]

export const newCardio = activityId => ({ activity: activityId, durationMin: '', distance: '', incline: '', resistance: '', cadence: '', intensity: '', avgHr: '', calories: '' })

const num = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Derived pace/speed so users don't have to calculate it themselves.
export function cardioDerived(cardio, durationMinFallback = 0) {
  if (!cardio) return []
  const activity = getActivity(cardio.activity)
  const minutes = num(cardio.durationMin) || durationMinFallback
  const distance = num(cardio.distance)
  const stats = []
  if (!minutes || !distance) return stats
  if (activity.unit === 'km') {
    stats.push({ label: 'Speed', value: `${(distance / (minutes / 60)).toFixed(1)} km/h` })
    const pace = minutes / distance
    stats.push({ label: 'Pace', value: `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')} /km` })
  } else if (activity.unit === 'm') {
    const split = (minutes * 60) / (distance / 500)
    stats.push({ label: 'Split', value: `${Math.floor(split / 60)}:${String(Math.round(split % 60)).padStart(2, '0')} /500m` })
  }
  return stats
}

export function formatCardioSummary(cardio) {
  if (!cardio) return ''
  const activity = getActivity(cardio.activity)
  const parts = []
  if (num(cardio.distance)) parts.push(`${cardio.distance} ${activity.unit}`)
  if (num(cardio.durationMin)) parts.push(`${cardio.durationMin} min`)
  if (num(cardio.intensity)) parts.push(`RPE ${cardio.intensity}`)
  return parts.join(' · ')
}

export const hasCardioData = cardio => Boolean(cardio) && ['distance', 'durationMin', 'intensity', 'calories', 'avgHr'].some(key => num(cardio[key]) > 0)

export function buildCardioLog(day, durationMs) {
  if (day.type !== 'cardio' || !day.cardio) return null
  const cardio = day.cardio
  const durationMin = num(cardio.durationMin) || Math.round((durationMs || 0) / 60000)
  return { ...cardio, durationMin: String(durationMin), activityName: getActivity(cardio.activity).name, unit: getActivity(cardio.activity).unit }
}
