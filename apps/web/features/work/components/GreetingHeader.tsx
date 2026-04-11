'use client'

import { useEffect, useState } from 'react'

export function GreetingHeader() {
  const [greeting, setGreeting] = useState('Good Morning')

  useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon')
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good Evening')
    } else {
      setGreeting('Good Night')
    }
  }, [])

  return (
    <div className="flex justify-between items-center px-0 py-0">
      {/* Left: Greeting */}
      <div className="space-y-0 m-0 ">
        <div className="text-l text-zinc-300 tracking-wide flex">
          {greeting}
        </div>

        <div className="text-2xl font-semibold text-zinc-100 tracking-wide">
          SHIKHAR SRIVASTAVA
        </div>
      </div>

      {/* Right: Status */}
      <div className="flex ml-10 items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-zinc-400 tracking-[0.12em]">CURRENTLY ALIVE</span>
      </div>
    </div>
  )
}
