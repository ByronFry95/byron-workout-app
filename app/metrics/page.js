'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { getMetricsHistory, saveMetrics, deleteMetricsEntry } from '@/lib/firebaseQueries'
import { calculateBodyFatNavy, getBodyFatCategory } from '@/lib/bodyFatCalculator'
import './metrics.css'

export default function MetricsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    waist: '',
    neck: '',
    hip: '',
    gender: 'male',
    date: new Date().toISOString().split('T')[0]
  })

  const [bodyFat, setBodyFat] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load from Firebase on mount
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const loadMetrics = async () => {
      try {
        const data = await getMetricsHistory(user.uid)
        setHistory(data)
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
      setLoading(false)
    }

    loadMetrics()
  }, [user, authLoading, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateBodyFat = () => {
    const { height, waist, neck, hip, gender } = measurements

    if (!height || !waist || !neck) {
      alert('Please fill in height, waist, and neck measurements')
      return
    }

    if (gender === 'female' && !hip) {
      alert('Please fill in hip measurement for female calculation')
      return
    }

    const bf = calculateBodyFatNavy(
      parseFloat(height),
      parseFloat(waist),
      parseFloat(neck),
      gender === 'female' ? parseFloat(hip) : 0,
      gender
    )

    setBodyFat(bf)
  }

  const saveMeasurements = async () => {
    if (!bodyFat) {
      alert('Please calculate body fat first')
      return
    }

    setIsSaving(true)
    try {
      const entry = {
        ...measurements,
        bodyFat,
        category: getBodyFatCategory(bodyFat, measurements.gender),
        date: new Date(measurements.date).toISOString()
      }

      await saveMetrics(user.uid, entry)

      // Reload history
      const updatedHistory = await getMetricsHistory(user.uid)
      setHistory(updatedHistory)

      setMeasurements({
        height: '',
        weight: '',
        waist: '',
        neck: '',
        hip: '',
        gender: 'male',
        date: new Date().toISOString().split('T')[0]
      })
      setBodyFat(null)
    } catch (error) {
      console.error('Error saving metrics:', error)
      alert('Error saving measurements. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      await deleteMetricsEntry(user.uid, id)
      setHistory(history.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting metrics entry:', error)
      alert('Error deleting entry. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (authLoading || loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <>
      <nav className="mb-5 flex items-center gap-5 bg-panel px-5 py-4 shadow-soft">
        <Link href="/" className="nav-link">Workouts</Link>
        <Link href="/metrics" className="nav-link active">Body Metrics</Link>
        <Link href="/data" className="nav-link">Data</Link>
        <Link href="/stats" className="nav-link">Stats</Link>
        <button
          onClick={handleLogout}
          className="ml-auto cursor-pointer border-none bg-transparent text-sm font-medium text-slate-700"
        >
          Logout
        </button>
      </nav>

      <main className="py-5">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Body Composition Tracker</h1>

        <div className="metrics-container">
          <div className="input-section">
            <h2>Enter Your Measurements</h2>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={measurements.gender}
                onChange={handleInputChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                name="height"
                placeholder="e.g., 180"
                value={measurements.height}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                name="weight"
                placeholder="e.g., 85"
                value={measurements.weight}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="neck">Neck (cm)</label>
              <input
                id="neck"
                type="number"
                name="neck"
                placeholder="e.g., 38"
                value={measurements.neck}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="waist">Waist (cm)</label>
              <input
                id="waist"
                type="number"
                name="waist"
                placeholder="e.g., 85"
                value={measurements.waist}
                onChange={handleInputChange}
              />
            </div>

            {measurements.gender === 'female' && (
              <div className="form-group">
                <label htmlFor="hip">Hip (cm)</label>
                <input
                  id="hip"
                  type="number"
                  name="hip"
                  placeholder="e.g., 100"
                  value={measurements.hip}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={measurements.date}
                onChange={handleInputChange}
              />
            </div>

            <button className="calculate-btn" onClick={calculateBodyFat}>
              Calculate Body Fat %
            </button>

            {bodyFat !== null && (
              <div className="result-card">
                <h3>Result</h3>
                <div className="body-fat-display">
                  <div className="body-fat-percentage">{bodyFat}%</div>
                  <div className="body-fat-category">
                    {getBodyFatCategory(bodyFat, measurements.gender)}
                  </div>
                </div>
                <button className="save-btn" onClick={saveMeasurements} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Measurements'}
                </button>
              </div>
            )}
          </div>

          <div className="history-section">
            <h2>Measurement History</h2>
            {history.length === 0 ? (
              <p className="no-history">No measurements saved yet</p>
            ) : (
              <div className="history-list">
                {history.map(entry => (
                  <div key={entry.id} className="history-card">
                    <div className="history-header">
                      <span className="history-date">{new Date(entry.date).toLocaleDateString()}</span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteEntry(entry.id)}
                        title="Delete entry"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="history-body">
                      <div className="history-item">
                        <span className="label">Weight:</span>
                        <span className="value">{entry.weight} kg</span>
                      </div>
                      <div className="history-item">
                        <span className="label">Body Fat:</span>
                        <span className="value">
                          {entry.bodyFat}% ({entry.category})
                        </span>
                      </div>
                      <div className="history-measurements">
                        <small>H: {entry.height}cm | N: {entry.neck}cm | W: {entry.waist}cm {entry.hip ? `| Hip: ${entry.hip}cm` : ''}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
