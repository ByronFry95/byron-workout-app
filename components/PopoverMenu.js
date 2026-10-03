'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MENU_WIDTH = 264
const EDGE_GAP = 12

// items: { label, icon, sub, onSelect, danger } | { section: 'Heading' } | { divider: true }
export default function PopoverMenu({ items, ariaLabel, triggerClassName = 'glass-orange-button', children, align = 'right' }) {
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight || 220
    const left = align === 'right' ? rect.right - MENU_WIDTH : rect.left
    const clampedLeft = Math.min(Math.max(EDGE_GAP, left), window.innerWidth - MENU_WIDTH - EDGE_GAP)
    const fitsBelow = rect.bottom + 8 + menuHeight < window.innerHeight - EDGE_GAP
    setPosition({ left: clampedLeft, top: fitsBelow ? rect.bottom + 8 : Math.max(EDGE_GAP, rect.top - 8 - menuHeight) })
  }, [open, align, items.length])

  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    const handleKey = event => event.key === 'Escape' && close()
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  const stop = event => event.stopPropagation()

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={stop}
        onClick={event => { event.stopPropagation(); setPosition(null); setOpen(previous => !previous) }}
      >
        {children}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60]" onPointerDown={stop} onClick={event => { event.stopPropagation(); setOpen(false) }}>
          <div
            ref={menuRef}
            role="menu"
            className="glass-popover fixed p-2 text-[var(--ink)]"
            style={{ width: MENU_WIDTH, left: position?.left ?? -9999, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
            onClick={stop}
          >
            {items.map((item, index) => {
              if (item.divider) return <div key={`d${index}`} className="mx-3 my-1 h-px bg-[var(--hairline)]" />
              if (item.section) return <p key={`s${index}`} className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--n-600)]">{item.section}</p>
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left active:bg-black/5 ${item.danger ? 'text-[var(--accent)]' : ''}`}
                  onClick={() => { setOpen(false); item.onSelect?.() }}
                >
                  {Icon && <Icon size={19} className="shrink-0" />}
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight">{item.label}</span>
                    {item.sub && <span className="block text-xs text-[var(--n-600)]">{item.sub}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
