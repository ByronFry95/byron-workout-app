'use client'

import { useEffect, useRef } from 'react'

const HOLD_MS = 450
const INTERACTIVE = 'button, input, textarea, select, a'

export default function ReorderItem({ id, dragging, onDragStart, onDragOver, onDragEnd, children }) {
  const ref = useRef(null)
  const state = useRef({ timer: null, active: false, startX: 0, startY: 0, suppressClick: false, lastSwap: 0, lastY: 0, raf: 0 })
  const handlers = useRef({})
  handlers.current = { onDragStart, onDragOver, onDragEnd }

  useEffect(() => {
    const node = ref.current
    const s = state.current

    const cleanupWindow = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    function autoScroll() {
      if (!s.active) return
      const edge = 90
      if (s.lastY < edge) window.scrollBy(0, -12)
      else if (s.lastY > window.innerHeight - edge) window.scrollBy(0, 12)
      s.raf = requestAnimationFrame(autoScroll)
    }

    function onMove(event) {
      s.lastY = event.clientY
      if (!s.active) {
        if (Math.abs(event.clientX - s.startX) > 8 || Math.abs(event.clientY - s.startY) > 8) {
          clearTimeout(s.timer)
          cleanupWindow()
        }
        return
      }
      if (Date.now() - s.lastSwap < 220) return
      const cards = Array.from(document.querySelectorAll('[data-reorder-id]'))
      const over = cards.find(card => {
        const rect = card.getBoundingClientRect()
        return event.clientY >= rect.top && event.clientY <= rect.bottom
      })
      if (!over || over.dataset.reorderId === String(id)) return
      const overRect = over.getBoundingClientRect()
      const ownRect = node.getBoundingClientRect()
      const movingDown = overRect.top > ownRect.top
      const midpoint = overRect.top + overRect.height / 2
      if (movingDown ? event.clientY < midpoint : event.clientY > midpoint) return
      s.lastSwap = Date.now()
      handlers.current.onDragOver(id, over.dataset.reorderId)
    }

    function onUp() {
      clearTimeout(s.timer)
      cleanupWindow()
      if (s.active) {
        s.active = false
        cancelAnimationFrame(s.raf)
        s.suppressClick = true
        setTimeout(() => { s.suppressClick = false }, 0)
        handlers.current.onDragEnd()
      }
    }

    const onDown = event => {
      if (event.button > 0 || event.target.closest(INTERACTIVE)) return
      s.startX = event.clientX
      s.startY = event.clientY
      clearTimeout(s.timer)
      s.timer = setTimeout(() => {
        s.active = true
        navigator.vibrate?.(15)
        s.raf = requestAnimationFrame(autoScroll)
        handlers.current.onDragStart(id)
      }, HOLD_MS)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    }

    const blockWhileDragging = event => {
      if (s.active) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const blockClick = event => {
      if (s.suppressClick) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    node.addEventListener('pointerdown', onDown)
    node.addEventListener('touchmove', blockWhileDragging, { passive: false })
    node.addEventListener('contextmenu', blockWhileDragging)
    node.addEventListener('selectstart', blockWhileDragging)
    node.addEventListener('dragstart', blockWhileDragging)
    node.addEventListener('click', blockClick, true)
    return () => {
      clearTimeout(s.timer)
      cancelAnimationFrame(s.raf)
      cleanupWindow()
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('touchmove', blockWhileDragging)
      node.removeEventListener('contextmenu', blockWhileDragging)
      node.removeEventListener('selectstart', blockWhileDragging)
      node.removeEventListener('dragstart', blockWhileDragging)
      node.removeEventListener('click', blockClick, true)
    }
  }, [id])

  return (
    <div
      ref={ref}
      data-reorder-id={id}
      className={`reorder-item ${dragging ? 'reorder-item-active' : ''}`}
    >
      {children}
    </div>
  )
}
