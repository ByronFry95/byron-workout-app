'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { getWorkoutSession, saveWorkoutSession } from '@/lib/firebaseQueries'

const WorkoutSessionContext = createContext(null)

export function WorkoutSessionProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const endHandler = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setSession(null)
      setLoading(false)
      return
    }

    getWorkoutSession(user.uid)
      .then(setSession)
      .catch(error => console.error('Error loading workout session:', error))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const startSession = async (metadata = {}) => {
    if (!user) return null
    const nextSession = {
      ...metadata,
      sessionId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startedAt: Date.now(),
      endedAt: null,
      durationMs: 0,
    }
    setSession(nextSession)
    await saveWorkoutSession(user.uid, nextSession)
    return nextSession
  }

  const endSession = async () => {
    if (!user || !session?.startedAt) return null
    const endedAt = Date.now()
    const nextSession = {
      ...session,
      endedAt,
      durationMs: endedAt - session.startedAt,
    }
    setSession(nextSession)
    await saveWorkoutSession(user.uid, nextSession)
    return nextSession
  }

  const registerEndHandler = (handler) => {
    endHandler.current = handler
    return () => {
      if (endHandler.current === handler) endHandler.current = null
    }
  }

  const requestEndSession = async () => {
    if (endHandler.current) return endHandler.current()
    return endSession()
  }

  return (
    <WorkoutSessionContext.Provider value={{ session, loading, startSession, endSession, registerEndHandler, requestEndSession }}>
      {children}
    </WorkoutSessionContext.Provider>
  )
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext)
  if (!context) throw new Error('useWorkoutSession must be used within WorkoutSessionProvider')
  return context
}
