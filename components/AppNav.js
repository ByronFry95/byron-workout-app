'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { BarChart3, BookOpen, Dumbbell, List, LogOut, UserRound, X } from 'lucide-react'

const navigation = [
  { href: '/workouts', label: 'Workouts', shortLabel: 'Workouts', icon: Dumbbell },
  { href: '/library', label: 'Library', shortLabel: 'Library', icon: BookOpen },
  { href: '/metrics', label: 'Body Metrics', shortLabel: 'Metrics', icon: UserRound },
  { href: '/data', label: 'Data', shortLabel: 'Data', icon: List },
  { href: '/stats', label: 'Stats', shortLabel: 'Stats', icon: BarChart3 },
]

export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="app-nav">
      <div className="app-nav-desktop">
        <div className="flex items-center gap-2 sm:gap-5">
          {navigation.map(item => (
            <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
          <button onClick={() => setProfileOpen(true)} className="ml-auto flex min-h-11 items-center gap-2 border-0 bg-transparent px-3 text-sm font-bold text-slate-700">
            <UserRound size={18} />
            Profile
          </button>
        </div>
      </div>

      <div className="app-nav-mobile">
        {navigation.map(item => (
          <Link key={item.href} href={item.href} className={`app-nav-item ${pathname === item.href ? 'active' : ''}`}>
            <item.icon className="app-nav-icon" aria-hidden="true" />
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setProfileOpen(false)}>
          <div className="w-full border-2 border-[var(--divider)] bg-[var(--surface)] p-5 sm:max-w-sm" onClick={event => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl">Profile</h2>
              <button type="button" onClick={() => setProfileOpen(false)} className="flex h-11 w-11 items-center justify-center border-0 bg-transparent"><X size={20} /></button>
            </div>
            <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--accent)] px-4 font-bold text-white">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
