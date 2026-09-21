'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getMetricsHistory, saveMetrics, deleteMetricsEntry } from '@/lib/firebaseQueries'
import { calculateBodyFatNavy, getBodyFatCategory } from '@/lib/bodyFatCalculator'
import AppNav from '@/components/AppNav'
import StatTiles from '@/components/StatTiles'
import Sheet from '@/components/Sheet'
import { ChevronDown, Trash2 } from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]

export default function MetricsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [measurements, setMeasurements] = useState({ height: '', weight: '', waist: '', neck: '', hip: '', gender: 'male', date: today() })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    getMetricsHistory(user.uid).then(data => {
      setHistory(data)
      const latest = data[0]
      if (latest) setMeasurements(previous => ({ ...previous, height: latest.height || '', weight: latest.weight || '', waist: latest.waist || '', neck: latest.neck || '', hip: latest.hip || '', gender: latest.gender || 'male', date: today() }))
    }).catch(error => setLoadError(error?.code || error?.message || 'Unable to load metrics.')).finally(() => setLoading(false))
  }, [user, authLoading, router])

  const updateField = event => setMeasurements(previous => ({ ...previous, [event.target.name]: event.target.value }))
  const { height, weight, waist, neck, hip, gender } = measurements
  const required = gender === 'female' ? [height, waist, neck, hip] : [height, waist, neck]
  const isValid = required.every(Boolean) && required.every(value => Number(value) > 0)
  const bodyFat = useMemo(() => isValid ? calculateBodyFatNavy(Number(height), Number(waist), Number(neck), gender === 'female' ? Number(hip) : 0, gender) : null, [height, waist, neck, hip, gender, isValid])

  const saveMeasurements = async () => {
    if (!bodyFat || !user) return
    setIsSaving(true)
    try {
      await saveMetrics(user.uid, { ...measurements, bodyFat, category: getBodyFatCategory(bodyFat, gender), date: new Date(measurements.date).toISOString() })
      setHistory(await getMetricsHistory(user.uid))
    } catch (error) { setLoadError(error?.message || 'Unable to save metrics.') } finally { setIsSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId || !user) return
    await deleteMetricsEntry(user.uid, deleteId)
    setHistory(previous => previous.filter(entry => entry.id !== deleteId))
    setDeleteId(null)
  }

  const latest = history[0]
  const previous = history[1]
  const delta = field => latest && previous && latest[field] && previous[field] ? Math.round((Number(latest[field]) - Number(previous[field])) * 100) / 100 : null

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading metrics...</div>
  if (!user) return null

  return (
    <>
      <AppNav />
      <main>
        <h1 className="mb-6 text-3xl text-[var(--ink)]">Body Metrics</h1>
        {loadError && <p className="mb-4 text-sm text-[var(--accent-700)]">{loadError}</p>}
        <StatTiles tiles={[{ label: 'Body Fat', value: latest ? `${latest.bodyFat}%` : '--', detail: delta('bodyFat') === null ? 'No comparison' : `${delta('bodyFat') > 0 ? '+' : ''}${delta('bodyFat')} since last` }, { label: 'Weight', value: latest?.weight ? `${latest.weight} kg` : '--', detail: delta('weight') === null ? 'No comparison' : `${delta('weight') > 0 ? '+' : ''}${delta('weight')} kg` }, { label: 'Waist', value: latest?.waist ? `${latest.waist} cm` : '--', detail: delta('waist') === null ? 'No comparison' : `${delta('waist') > 0 ? '+' : ''}${delta('waist')} cm` }]} />
        <section className="mt-8 border-t-2 border-[var(--divider)] pt-5"><h2 className="mb-4 text-xl">New measurement</h2><div className="mb-3 flex items-center justify-between border-y border-[var(--hairline)] py-2"><span className="text-sm font-bold">Measurement date</span><input name="date" type="date" value={measurements.date} onChange={updateField} className="min-h-11 border-2 border-[var(--hairline)] bg-transparent px-2 text-sm" /></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{['weight', 'waist', 'neck', 'height'].map(name => <label key={name} className="text-sm font-bold">{name}<input name={name} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={measurements[name]} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3" /></label>)}<label className="text-sm font-bold">Gender<select name="gender" value={gender} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3"><option value="male">Male</option><option value="female">Female</option></select></label>{gender === 'female' && <label className="text-sm font-bold">Hip<input name="hip" type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={hip} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3" /></label>}</div>{!isValid && <p className="mt-3 text-sm text-[var(--accent-700)]">Enter positive measurements to calculate body fat.</p>}{bodyFat !== null && <div className="mt-5 flex items-center justify-between border-y-2 border-[var(--divider)] py-4"><div><p className="text-xs uppercase text-[var(--n-600)]">Estimated body fat</p><p className="num text-4xl">{bodyFat}%</p></div><button type="button" onClick={saveMeasurements} disabled={isSaving} className="min-h-11 bg-[var(--accent)] px-4 font-bold text-white disabled:opacity-40">{isSaving ? 'SAVING' : 'SAVE'}</button></div>}</section>
        <section className="mt-8 border-t-2 border-[var(--divider)] pt-5"><h2 className="mb-3 text-xl">History</h2>{history.length === 0 ? <div className="border-y border-[var(--hairline)] py-6"><p className="font-bold">No measurements yet</p><p className="mt-1 text-sm text-[var(--n-600)]">Save your first measurement above.</p></div> : <div>{history.map(entry => <div key={entry.id} className="border-b border-[var(--hairline)]"><button type="button" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} className="grid min-h-14 w-full grid-cols-[1fr_1fr_1fr_2rem] items-center gap-2 text-left text-sm"><span>{new Date(entry.date).toLocaleDateString('en-GB')}</span><span>{entry.weight || '--'} kg</span><span>{entry.bodyFat}%</span><ChevronDown size={16} /></button>{expandedId === entry.id && <div className="grid grid-cols-2 gap-2 border-t border-[var(--hairline)] py-3 text-sm text-[var(--n-600)]"><span>Height {entry.height}cm</span><span>Neck {entry.neck}cm</span><span>Waist {entry.waist}cm</span><span>{entry.hip ? `Hip ${entry.hip}cm` : entry.category}</span><button type="button" onClick={() => setDeleteId(entry.id)} className="mt-2 flex min-h-11 items-center gap-2 text-[var(--ink)]"><Trash2 size={16} /> Delete</button></div>}</div>)}</div>}</section>
      </main>
      <Sheet open={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete measurement?"><p className="text-sm text-[var(--n-600)]">This removes the saved measurement from your history.</p><button type="button" onClick={confirmDelete} className="mt-5 min-h-11 w-full bg-[var(--accent)] font-bold text-white">DELETE</button></Sheet>
    </>
  )
}
