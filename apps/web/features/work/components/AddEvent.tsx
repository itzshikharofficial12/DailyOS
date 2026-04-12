'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface AddEventProps {
  onEventAdded?: () => void
  eventId?: number
}

export function AddEvent({ onEventAdded, eventId }: AddEventProps) {
  const [isExpanded, setIsExpanded] = useState(!!eventId)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!!eventId)
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch event data if editing
  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single()

          if (fetchError) {
            setError('Failed to load event')
            return
          }

          if (data) {
            setTitle(data.title)
            setDatetime(data.datetime ? data.datetime.substring(0, 16) : '')
            setMeetingLink(data.meeting_link || '')
          }
        } catch (err) {
          setError('Failed to load event')
        } finally {
          setIsFetching(false)
        }
      }

      fetchEvent()
    }
  }, [eventId])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (eventId) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update({
            title: title.trim(),
            datetime: datetime || null,
            meeting_link: meetingLink.trim() || null,
          })
          .eq('id', eventId)

        if (updateError) {
          setError(updateError.message)
          return
        }
      } else {
        // Create new event
        const { error: insertError } = await supabase.from('events').insert({
          title: title.trim(),
          datetime: datetime || null,
          meeting_link: meetingLink.trim() || null,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      // Reset form
      setTitle('')
      setDatetime('')
      setMeetingLink('')
      setIsExpanded(false)
      onEventAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDatetime('')
    setMeetingLink('')
    setError(null)
    setIsExpanded(false)
  }

  if (isFetching) {
    return (
      <div className="w-full p-4 text-center">
        <span className="mc-mono" style={{ fontSize: 11, color: '#52525b' }}>Loading...</span>
      </div>
    )
  }

  if (!isExpanded && !eventId) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-2 text-sm font-medium text-blue-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/30 hover:bg-zinc-800/50 transition-all"
      >
        + ADD EVENT
      </button>
    )
  }

  return (
    <div className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
      {/* Title Input */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          disabled={isLoading}
        />
      </div>

      {/* Datetime Input */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-blue-500/50"
          disabled={isLoading}
        />
      </div>

      {/* Meeting Link Input */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Meeting Link
        </label>
        <input
          type="url"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2.5 py-1.5">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : eventId ? 'Update' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
