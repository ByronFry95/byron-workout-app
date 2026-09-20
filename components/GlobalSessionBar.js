'use client'

import { usePathname } from 'next/navigation'
import WorkoutTimer from '@/components/WorkoutTimer'
import { useWorkoutSession } from '@/lib/workoutSessionContext'

export default function GlobalSessionBar() {
  const pathname = usePathname()
  const { session, requestEndSession } = useWorkoutSession()

  if (!session?.startedAt || session?.endedAt || pathname === '/session') return null

  return <WorkoutTimer session={session} onEndDay={requestEndSession} />
}
