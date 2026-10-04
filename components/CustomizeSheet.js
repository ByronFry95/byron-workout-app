'use client'

import { SlidersHorizontal } from 'lucide-react'
import Sheet from './Sheet'

export function CustomizeButton({ onClick }) {
  return <button type="button" onClick={onClick} aria-label="Customize view" className="glass-icon-button flex h-10 w-10 items-center justify-center rounded-full"><SlidersHorizontal size={18} /></button>
}

export default function CustomizeSheet({ open, onClose, title = 'Show / hide', groups, isShown, onToggle }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="pb-4">
        {groups.map(group => (
          <div key={group.title} className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--n-600)]">{group.title}</p>
            <div className="glass-card overflow-hidden rounded-2xl">
              {group.items.map(item => (
                <button key={item.id} type="button" role="switch" aria-checked={isShown(item.id)} onClick={() => onToggle(item.id)} className="glass-row flex min-h-14 w-full items-center justify-between border-0 bg-transparent px-4 text-left text-base font-semibold">
                  <span>{item.label}</span>
                  <span className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${isShown(item.id) ? 'bg-[var(--accent)]' : 'bg-black/15'}`}><span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${isShown(item.id) ? 'translate-x-5' : ''}`} /></span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
