'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AppNav from '@/components/AppNav'

const NavTitleContext = createContext(() => {})
const navPaths = ['/workouts', '/metrics', '/library', '/stats', '/data', '/dev-notes', '/session']

export function useNavTitle(title) {
  const setTitle = useContext(NavTitleContext)
  useEffect(() => {
    setTitle(title || null)
    return () => setTitle(null)
  }, [title, setTitle])
}

export default function NavShell({ children }) {
  const pathname = usePathname()
  const [title, setTitle] = useState(null)
  return (
    <NavTitleContext.Provider value={setTitle}>
      {navPaths.includes(pathname) && <AppNav title={title} />}
      {children}
    </NavTitleContext.Provider>
  )
}
