'use client'

import Sheet from './Sheet'
import { CARDIO_ACTIVITIES } from '@/lib/cardio'

export default function CardioSheet({ open, onClose, onPick }) {
  return (
    <Sheet open={open} onClose={onClose} title="Add cardio day">
      <div className="glass-card overflow-hidden rounded-2xl pb-0">
        {CARDIO_ACTIVITIES.map(activity => (
          <button key={activity.id} type="button" onClick={() => { onPick(activity); onClose() }} className="glass-row flex min-h-14 w-full items-center justify-between border-0 bg-transparent px-4 text-left text-base font-semibold">
            <span>{activity.name}</span><span className="text-xs text-[var(--n-600)]">{activity.unit}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
