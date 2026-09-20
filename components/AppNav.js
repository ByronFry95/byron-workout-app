'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

const navigation = [
  { href: '/', label: 'Workouts', shortLabel: 'Workouts', icon: '⚖' },
  { href: '/metrics', label: 'Body Metrics', shortLabel: 'Metrics', icon: '◉' },
  { href: '/data', label: 'Data', shortLabel: 'Data', icon: '▤' },
  { href: '/stats', label: 'Stats', shortLabel: 'Stats', icon: '▥' },
]

export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

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
          <button onClick={handleLogout} className="ml-auto cursor-pointer border-none bg-transparent text-sm font-medium text-slate-700">
            Logout
          </button>
        </div>
      </div>

      <div className="app-nav-mobile">
        {navigation.map(item => (
          <Link key={item.href} href={item.href} className={`app-nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span className="app-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
        <button type="button" onClick={handleLogout} className="app-nav-item">
          <span className="app-nav-icon" aria-hidden="true">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
