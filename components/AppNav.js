'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import PopoverMenu from '@/components/PopoverMenu'
import { useEffect } from 'react'
import { BarChart3, BookOpen, ClipboardList, Dumbbell, Ellipsis, List, LogOut, UserRound } from 'lucide-react'

const primaryNavigation = [
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/metrics', label: 'Metrics', icon: UserRound },
]

const moreNavigation = [
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/data', label: 'Data', icon: List },
  { href: '/dev-notes', label: 'Dev Notes', icon: ClipboardList },
]

const pageTitles = {
  '/workouts': 'Workout Tracker',
  '/library': 'Exercise Library',
  '/metrics': 'Body Metrics',
  '/data': 'Workout Data',
  '/stats': 'Stats',
  '/dev-notes': 'Dev Notes',
}

export default function AppNav({ title }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const mobileTitle = title || pageTitles[pathname] || (pathname === '/session' ? 'Workout Session' : 'Training App')
  const moreActive = moreNavigation.some(item => item.href === pathname)

  useEffect(() => {
    ;[...primaryNavigation, ...moreNavigation].forEach(item => router.prefetch(item.href))
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const moreItems = [
    ...moreNavigation.map(item => ({ label: item.label, icon: item.icon, onSelect: () => router.push(item.href) })),
    { divider: true },
    { label: 'Log out', icon: LogOut, danger: true, onSelect: handleLogout },
  ]

  return (
    <nav className="app-nav">
      <div className="app-nav-mobile-header">
        <h1 className="truncate text-lg text-[var(--ink)]">{mobileTitle}</h1>
      </div>

      <div className="app-nav-desktop">
        <div className="flex items-center gap-2 sm:gap-3">
          {primaryNavigation.map(item => (
            <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
          <div className="ml-auto">
            <PopoverMenu items={moreItems} ariaLabel="More" triggerClassName={`glass-orange-button ${moreActive ? 'ring-2 ring-[var(--ink)]' : ''}`}><Ellipsis size={18} /></PopoverMenu>
          </div>
        </div>
      </div>

      <div className="app-nav-mobile">
        {primaryNavigation.map(item => (
          <Link key={item.href} href={item.href} className={`app-nav-item ${pathname === item.href ? 'active' : ''}`}>
            <item.icon className="app-nav-icon" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
        <div className={`app-nav-item ${moreActive ? 'active' : ''}`}>
          <PopoverMenu items={moreItems} ariaLabel="More" triggerClassName="app-nav-more"><Ellipsis className="app-nav-icon" aria-hidden="true" /><span>More</span></PopoverMenu>
        </div>
      </div>
    </nav>
  )
}
