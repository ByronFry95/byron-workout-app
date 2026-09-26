'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Sheet({ open, onClose, title, children, className = '', fullScreen = false }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = event => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 ${fullScreen ? 'bg-[var(--surface)]' : 'flex items-end bg-black/40 sm:items-center'}`} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`sheet-panel w-full border-t-2 border-[var(--divider)] bg-[var(--surface)] p-5 sm:max-w-md ${fullScreen ? 'flex h-[100dvh] max-w-none flex-col border-0 p-0 !pb-0' : ''} ${className}`}
        onClick={event => event.stopPropagation()}
      >
        {!fullScreen && <div className="mx-auto mb-4 h-1 w-12 bg-[var(--n-500)]" />}
        <div className={`flex shrink-0 items-center justify-between ${fullScreen ? 'px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]' : 'mb-4'}`}>
          {title && <h2 className="text-xl">{title}</h2>}
          <button type="button" onClick={onClose} className="ml-auto flex h-11 w-11 items-center justify-center border-0 bg-transparent" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
