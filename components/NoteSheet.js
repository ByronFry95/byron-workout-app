'use client'

import { useEffect, useState } from 'react'
import Sheet from './Sheet'

export default function NoteSheet({ open, onClose, title, value, onSave, placeholder = 'Add a note...' }) {
  const [draft, setDraft] = useState(value || '')

  useEffect(() => {
    if (open) setDraft(value || '')
  }, [open, value])

  const close = text => {
    onSave(text.trim())
    onClose()
  }

  return (
    <div onClick={event => event.stopPropagation()}>
      <Sheet open={open} onClose={onClose} title={title}>
        <div className="pb-6">
          <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={5} autoFocus placeholder={placeholder} className="w-full rounded-2xl border border-[var(--hairline)] bg-white/70 p-3 text-base outline-none" />
          <div className="mt-4 flex gap-2">
            {value && <button type="button" onClick={() => close('')} className="glass-pill-light h-12 flex-1 text-sm font-bold">Delete note</button>}
            <button type="button" onClick={() => close(draft)} className="glass-pill h-12 flex-1 text-sm">Save note</button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
