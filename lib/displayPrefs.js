'use client'

import { useCallback, useEffect, useState } from 'react'

// Per-device list of hidden item ids, kept in localStorage per page scope.
export function useHiddenItems(scope) {
  const key = `display-hidden:${scope}`
  const [hidden, setHidden] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(key) || '[]')
      if (Array.isArray(stored)) setHidden(stored)
    } catch {
      setHidden([])
    }
  }, [key])

  const toggle = useCallback(id => {
    setHidden(previous => {
      const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]
      try { window.localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  const isShown = useCallback(id => !hidden.includes(id), [hidden])
  return { hidden, isShown, toggle }
}
