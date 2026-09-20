'use client'

import { useEffect } from 'react'

export default function ViewportManager() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return undefined

    const updateViewport = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
    }

    updateViewport()
    viewport.addEventListener('resize', updateViewport)
    viewport.addEventListener('scroll', updateViewport)
    return () => {
      viewport.removeEventListener('resize', updateViewport)
      viewport.removeEventListener('scroll', updateViewport)
    }
  }, [])

  return null
}
