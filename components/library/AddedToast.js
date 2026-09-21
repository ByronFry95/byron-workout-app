'use client'

import { Undo2 } from 'lucide-react'

export default function AddedToast({ dayName, onUndo }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-3 border-t-2 border-[var(--divider)] bg-[var(--ink)] px-5 py-3 text-white sm:bottom-0">
      <span className="text-sm leading-snug">Added to <strong className="font-bold">{dayName}</strong></span>
      <button type="button" onClick={onUndo} className="flex min-h-11 items-center gap-2 border-2 border-white px-3 text-xs font-bold tracking-wide">
        <Undo2 size={14} />UNDO
      </button>
    </div>
  )
}
