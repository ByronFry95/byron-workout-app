'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth'

const AuthContext = createContext()

const CACHE_KEY = 'authCachedUser'

const readCachedUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeCachedUser = (currentUser) => {
  if (typeof window === 'undefined') return
  try {
    if (currentUser) {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ uid: currentUser.uid, email: currentUser.email }))
    } else {
      window.localStorage.removeItem(CACHE_KEY)
    }
  } catch {
    // storage unavailable, ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readCachedUser())
  // Skip the loading gate when a cached session exists so a closed/reopened app doesn't bounce to login
  // while Firebase silently rehydrates the real session in the background.
  const [loading, setLoading] = useState(() => !readCachedUser())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      writeCachedUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
