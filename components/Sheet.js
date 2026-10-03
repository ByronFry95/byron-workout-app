'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Open sheets register here so the browser/OS back gesture only closes the top-most one.
const sheetStack = []
let suppressedPops = 0
const pendingBacks = new Map()

function closeHistoryEntry() {
  suppressedPops += 1
  window.addEventListener('popstate', () => { suppressedPops = Math.max(0, suppressedPops - 1) }, { once: true })
  window.history.back()
}

const DISMISS_DISTANCE = 110

export default function Sheet({ open, onClose, title, children, className = '', fullScreen = false, footer = null, leading = null, trailing = null, headerless = false }) {
  const sheetId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const drag = useRef({ active: false, startY: 0, delta: 0 })

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = event => event.key === 'Escape' && sheetStack[sheetStack.length - 1] === sheetId && onCloseRef.current()
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    sheetStack.push(sheetId)
    // A just-cleaned-up effect (React strict-mode remount) leaves its entry in place; reuse it instead of stacking another.
    if (pendingBacks.has(sheetId)) {
      window.clearTimeout(pendingBacks.get(sheetId))
      pendingBacks.delete(sheetId)
    } else {
      window.history.pushState({ ...window.history.state, sheet: sheetId }, '')
    }
    let closedByPop = false
    const handlePop = () => {
      if (suppressedPops > 0 || sheetStack[sheetStack.length - 1] !== sheetId) return
      closedByPop = true
      onCloseRef.current()
    }
    window.addEventListener('popstate', handlePop)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('popstate', handlePop)
      const index = sheetStack.indexOf(sheetId)
      if (index !== -1) sheetStack.splice(index, 1)
      if (!closedByPop && window.history.state?.sheet === sheetId) {
        pendingBacks.set(sheetId, window.setTimeout(() => {
          pendingBacks.delete(sheetId)
          if (window.history.state?.sheet === sheetId) closeHistoryEntry()
        }, 0))
      }
    }
  }, [open, sheetId])

  if (!open) return null

  const handleDragStart = event => {
    drag.current = { active: true, startY: event.clientY, delta: 0 }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    if (panelRef.current) panelRef.current.style.transition = 'none'
  }

  const handleDragMove = event => {
    if (!drag.current.active) return
    drag.current.delta = Math.max(0, event.clientY - drag.current.startY)
    if (panelRef.current) panelRef.current.style.transform = `translateY(${drag.current.delta}px)`
  }

  const handleDragEnd = () => {
    if (!drag.current.active) return
    drag.current.active = false
    if (drag.current.delta > DISMISS_DISTANCE) {
      onClose()
      return
    }
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)'
      panelRef.current.style.transform = 'translateY(0)'
    }
  }

  const dragHandlers = { onPointerDown: handleDragStart, onPointerMove: handleDragMove, onPointerUp: handleDragEnd, onPointerCancel: handleDragEnd }

  const portal = node => (typeof document === 'undefined' ? null : createPortal(node, document.body))

  if (fullScreen) {
    return portal(
      <div className="fixed inset-0 z-50 bg-[var(--surface)]" onClick={onClose} onPointerDown={event => event.stopPropagation()}>
        <div
          role="dialog"
          aria-modal="true"
          className={`sheet-panel flex h-[100dvh] w-full max-w-none flex-col bg-[var(--surface)] p-0 !pb-0 ${className}`}
          onClick={event => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            {title && <h2 className="text-xl">{title}</h2>}
            <button type="button" onClick={onClose} className="glass-icon-button ml-auto" aria-label="Close"><X size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  return portal(
    <div className="glass-backdrop fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" onClick={onClose} onPointerDown={event => event.stopPropagation()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`glass-sheet sheet-panel flex max-h-[92dvh] w-full flex-col p-0 sm:max-w-md ${className}`}
        onClick={event => event.stopPropagation()}
      >
        <div className="shrink-0 cursor-grab touch-none px-5 pt-3 active:cursor-grabbing" {...dragHandlers}>
          <div className="mx-auto h-1.5 w-11 rounded-full bg-[var(--n-300)]" />
        </div>
        {!headerless && (
          <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-3">
            {leading}
            {title && <h2 className={`min-w-0 flex-1 text-xl ${leading ? 'text-center' : ''}`}>{title}</h2>}
            {!title && <span className="flex-1" />}
            {trailing || (!leading && (
              <button type="button" onClick={onClose} className="glass-icon-button ml-auto shrink-0" aria-label="Close"><X size={18} /></button>
            ))}
            {leading && !trailing && <span className="h-10 w-10 shrink-0" aria-hidden="true" />}
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 ${footer ? 'pb-24' : ''}`}>
          {children}
        </div>
        {footer && (
          <div className="sheet-footer-fade pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-[28px] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-10">
            <div className="pointer-events-auto">{footer}</div>
          </div>
        )}
      </div>
    </div>
  )
}
