'use client'

import { CARDIO_ACTIVITIES, CARDIO_FIELD_LABELS, cardioDerived, formatCardioSummary, getActivity } from '@/lib/cardio'

const inputClass = 'h-12 w-full rounded-2xl border border-[var(--hairline)] bg-white/70 px-3 text-center text-lg font-bold outline-none focus:border-[var(--accent)]'

export default function CardioPanel({ day, onChange, sessionMode = false }) {
  const cardio = day.cardio
  if (!cardio) return null
  const activity = getActivity(cardio.activity)
  const derived = cardioDerived(cardio)
  const set = (key, value) => onChange({ ...cardio, [key]: value })

  if (!sessionMode) {
    return (
      <div className="glass-card rounded-2xl px-4 py-3">
        <p className="text-sm font-bold text-[var(--ink)]">{activity.name}</p>
        <p className="mt-1 text-xs text-[var(--n-600)]">{formatCardioSummary(cardio) || 'Log distance, time and intensity during your session.'}</p>
      </div>
    )
  }

  const fields = [...activity.fields, 'avgHr', 'calories']
  const labelFor = key => key === 'distance' ? `Distance (${activity.unit})` : key === 'avgHr' ? 'Avg HR (optional)' : key === 'calories' ? 'Calories (optional)' : CARDIO_FIELD_LABELS[key]

  return (
    <div className="flex flex-col gap-4" onPointerDown={event => event.stopPropagation()} data-exercise-card>
      <div className="glass-card rounded-3xl p-4">
        <label className="text-xs font-bold uppercase tracking-wide text-[var(--n-600)]" htmlFor={`activity-${day.id}`}>Activity</label>
        <select id={`activity-${day.id}`} value={cardio.activity} onChange={event => set('activity', event.target.value)} className={`${inputClass} mt-1 appearance-none`}>
          {CARDIO_ACTIVITIES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-[var(--n-600)]">Time (min)</label>
            <input inputMode="decimal" value={cardio.durationMin ?? ''} onChange={event => set('durationMin', event.target.value)} placeholder="Auto" className={`${inputClass} mt-1`} />
          </div>
          {fields.map(key => (
            <div key={key}>
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--n-600)]">{labelFor(key)}</label>
              <input inputMode="decimal" value={cardio[key] ?? ''} onChange={event => set(key, event.target.value)} className={`${inputClass} mt-1`} />
            </div>
          ))}
        </div>
        {derived.length > 0 && <div className="mt-3 flex gap-4 text-sm">{derived.map(item => <span key={item.label} className="text-[var(--n-600)]">{item.label}: <strong className="num text-[var(--ink)]">{item.value}</strong></span>)}</div>}
        <p className="mt-3 text-xs text-[var(--n-600)]">Calories are best taken from the machine or your watch, so they are optional.</p>
      </div>
    </div>
  )
}
