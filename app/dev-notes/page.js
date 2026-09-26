'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { createDevNote, getDevNotes, updateDevNoteStatus } from '@/lib/firebaseQueries'
import AppNav from '@/components/AppNav'

const emptyForm = { title: '', type: 'Bug', page: '', details: '' }
const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'wont-fix', label: "Won't fix" },
]

const formatDate = value => {
  const date = value?.toDate?.()
  return date ? date.toLocaleString() : 'Just now'
}

export default function DevNotesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    let cancelled = false
    const loadNotes = async () => {
      try {
        const token = await user.getIdTokenResult(true)
        const admin = token.claims.admin === true
        const data = await getDevNotes(user.uid, admin)
        if (cancelled) return
        setIsAdmin(admin)
        setNotes(data)
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load notes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadNotes()
    return () => { cancelled = true }
  }, [user, authLoading, router])

  const updateField = event => {
    setSaved(false)
    setFormError('')
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const submitNote = async event => {
    event.preventDefault()
    if (!user || saving) return
    setSaving(true)
    setFormError('')
    setSaved(false)
    try {
      await createDevNote(user.uid, user.email, {
        ...form,
        title: form.title.trim(),
        page: form.page.trim(),
        details: form.details.trim(),
      })
      setForm(emptyForm)
      setSaved(true)
      setNotes(await getDevNotes(user.uid, isAdmin))
    } catch (error) {
      setFormError(error?.message || 'Unable to submit this note.')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (noteId, status) => {
    try {
      await updateDevNoteStatus(noteId, status)
      setNotes(previous => previous.map(note => note.id === noteId ? { ...note, status } : note))
    } catch (error) {
      setLoadError(error?.message || 'Unable to update note status.')
    }
  }

  if (authLoading || loading) return <div className="min-h-screen bg-page px-5 py-10 text-center font-dark">Loading Dev Notes...</div>
  if (!user) return null

  return (
    <>
      <AppNav />
      <main>
        <h1 className="mb-6 text-3xl text-[var(--ink)]">Dev Notes</h1>
        <section className="border-t-2 border-[var(--divider)] pt-5">
          <h2 className="mb-1 text-xl">Submit a UAT note</h2>
          <p className="mb-5 text-sm text-[var(--n-600)]">Report a bug, usability issue, or idea while testing.</p>
          <form onSubmit={submitNote} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold sm:col-span-2">
              Summary
              <input name="title" required maxLength={120} value={form.title} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3 font-normal" placeholder="What happened?" />
            </label>
            <label className="text-sm font-bold">
              Type
              <select name="type" value={form.type} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3 font-normal">
                <option>Bug</option><option>Usability</option><option>Idea</option>
              </select>
            </label>
            <label className="text-sm font-bold">
              Page or area
              <input name="page" maxLength={80} value={form.page} onChange={updateField} className="mt-1 min-h-11 w-full border-2 border-[var(--hairline)] bg-transparent px-3 font-normal" placeholder="For example, Session" />
            </label>
            <label className="text-sm font-bold sm:col-span-2">
              Details
              <textarea name="details" required maxLength={5000} rows={5} value={form.details} onChange={updateField} className="mt-1 w-full resize-y border-2 border-[var(--hairline)] bg-transparent px-3 py-2 font-normal" placeholder="Steps to reproduce, expected behavior, and what you saw" />
            </label>
            {formError && <p role="alert" className="text-sm text-[var(--accent-700)] sm:col-span-2">{formError}</p>}
            {saved && <p role="status" className="text-sm font-bold text-[var(--accent-700)] sm:col-span-2">Note submitted.</p>}
            <button type="submit" disabled={saving} className="min-h-11 w-full bg-[var(--accent)] px-4 text-sm font-bold text-white disabled:opacity-50 sm:w-auto">{saving ? 'SUBMITTING...' : 'SUBMIT NOTE'}</button>
          </form>
        </section>

        <section className="mt-8 border-t-2 border-[var(--divider)] pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl">{isAdmin ? 'All UAT notes' : 'My notes'}</h2>
            {isAdmin && <span className="text-xs font-bold uppercase text-[var(--accent)]">Admin view</span>}
          </div>
          {loadError && <p role="alert" className="mb-3 text-sm text-[var(--accent-700)]">{loadError}</p>}
          {notes.length === 0 ? (
            <p className="border-y border-[var(--hairline)] py-5 text-sm text-[var(--n-600)]">No notes submitted yet.</p>
          ) : notes.map(note => (
            <article key={note.id} className="border-b border-[var(--hairline)] py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-base">{note.title}</h3>
                    <span className="text-xs font-bold uppercase text-[var(--accent)]">{note.type}</span>
                    {note.page && <span className="text-xs text-[var(--n-600)]">{note.page}</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--n-700)]">{note.details}</p>
                  <p className="mt-2 text-xs text-[var(--n-600)]">{formatDate(note.createdAt)}{isAdmin ? ` · ${note.userEmail || note.userId}` : ''}</p>
                </div>
                {isAdmin ? (
                  <select aria-label={`Status for ${note.title}`} value={note.status} onChange={event => changeStatus(note.id, event.target.value)} className="min-h-10 shrink-0 border border-[var(--divider)] bg-[var(--surface)] px-2 text-xs font-bold">
                    {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                ) : <span className="shrink-0 text-xs font-bold uppercase text-[var(--n-600)]">{statuses.find(status => status.value === note.status)?.label || 'Open'}</span>}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}