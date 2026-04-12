'use client'

import { QuickStats as QuickStatsComponent } from './QuickStatsRefactored'

export default function QuickStats() {
  const stats = [
    { label: 'Projects', value: '8' },
    { label: 'Active', value: '3' },
    { label: 'Tasks', value: '24' },
    { label: 'Completed', value: '18' },
  ]

  return <QuickStatsComponent stats={stats} />
}
