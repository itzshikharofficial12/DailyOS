'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getEventStatus, EventStatus } from '@/lib/eventStatus'
import { AddEvent } from './AddEvent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Event {
  id: number
  title: string
  datetime: string | null
  meeting_link: string | null
  created_at: string
}

interface ScheduleListProps {
  schedule?: any[]
}

const TYPE_MAP: Record<EventStatus, { cls: string; icon: string; dot: string }> = {
  upcoming: { cls: 'mc-badge-upcoming', icon: '→', dot: '#3b82f6' },
  done:     { cls: 'mc-badge-done',     icon: '✓', dot: '#22c55e' },
  live:     { cls: 'mc-badge-live',     icon: '●', dot: '#22c55e' },
}

export function ScheduleList({ schedule }: ScheduleListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('datetime', { ascending: true, nullsFirst: false })

        if (error) {
          console.error('Error fetching events:', error)
          setEvents([])
          return
        }

        setEvents(data || [])
      } catch (err) {
        console.error('Error fetching events:', err)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
    
    // Refresh every minute to update statuses
    const interval = setInterval(fetchEvents, 60000)
    return () => clearInterval(interval)
  }, [refreshTrigger])

  const upcoming = events.filter(e => getEventStatus(e.datetime) === 'upcoming').length
  const completed = events.filter(e => getEventStatus(e.datetime) === 'done').length

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) {
        console.error('Error deleting event:', error)
        return
      }
      setRefreshTrigger(prev => prev + 1)
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }

  return (
    <>
      <div className="mc-root mc-card col-span-2" style={{ padding: 0 }}>
        <div className="mc-corner mc-corner-tl" /><div className="mc-corner mc-corner-tr" />
        <div className="mc-corner mc-corner-bl" /><div className="mc-corner mc-corner-br" />

        {/* Header */}
        <div className="mc-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3b82f6', fontSize: 12 }}>≡</span>
            <span className="mc-mono mc-label">MISSION_LOG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="mc-dot" style={{ background: '#3b82f6' }} />
              <span className="mc-mono mc-label">{upcoming} UPCOMING</span>
            </div>
            <div style={{ width: 1, height: 10, background: '#27272a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="mc-dot" style={{ background: '#22c55e' }} />
              <span className="mc-mono mc-label">{completed} COMPLETED</span>
            </div>
            <button
              onClick={() => setIsAddingEvent(true)}
              className="mc-mono"
              style={{
                marginLeft: 8,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 4,
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                const elem = e.currentTarget as HTMLButtonElement
                elem.style.background = 'rgba(59,130,246,0.2)'
                elem.style.borderColor = 'rgba(59,130,246,0.5)'
              }}
              onMouseLeave={(e) => {
                const elem = e.currentTarget as HTMLButtonElement
                elem.style.background = 'rgba(59,130,246,0.1)'
                elem.style.borderColor = 'rgba(59,130,246,0.3)'
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="mc-card-body" style={{ position: 'relative', zIndex: 1 }}>
          {isAddingEvent ? (
            <div style={{ padding: '12px 8px' }}>
              <AddEvent onEventAdded={() => {
                setIsAddingEvent(false)
                setRefreshTrigger(prev => prev + 1)
              }} />
            </div>
          ) : isLoading ? (
            <div style={{ padding: '16px 8px', textAlign: 'center' }}>
              <span className="mc-mono" style={{ fontSize: 11, color: '#52525b' }}>Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '16px 8px', textAlign: 'center' }}>
              <span className="mc-mono" style={{ fontSize: 11, color: '#52525b' }}>No events scheduled</span>
            </div>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {events.map((event, i) => {
                const status = getEventStatus(event.datetime)
                const t = TYPE_MAP[status]
                const eventDateTime = event.datetime 
                  ? new Date(event.datetime).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    }) + ' ' + new Date(event.datetime).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })
                  : 'No time'
                
                return (
                  <li
                    key={event.id}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '9px 8px',
                      borderBottom: i < events.length - 1 ? '1px solid rgba(39,39,42,0.5)' : 'none',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mc-mono" style={{ fontSize: 10, color: t.dot, width: 12 }}>
                        {t.icon}
                      </span>
                      <span className="mc-mono" style={{ fontSize: 11, color: status === 'done' ? '#52525b' : '#a1a1aa' }}>
                        {event.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {event.meeting_link && (
                        <a
                          href={event.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mc-mono"
                          style={{
                            fontSize: 9,
                            padding: '4px 8px',
                            color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            backgroundColor: 'rgba(59,130,246,0.05)',
                            display: 'inline-block',
                          }}
                          onMouseEnter={(e) => {
                            const elem = e.currentTarget as HTMLAnchorElement
                            elem.style.backgroundColor = 'rgba(59,130,246,0.12)'
                            elem.style.borderColor = 'rgba(59,130,246,0.5)'
                          }}
                          onMouseLeave={(e) => {
                            const elem = e.currentTarget as HTMLAnchorElement
                            elem.style.backgroundColor = 'rgba(59,130,246,0.05)'
                            elem.style.borderColor = 'rgba(59,130,246,0.3)'
                          }}
                        >
                          JOIN
                        </a>
                      )}
                      <span className="mc-mono" style={{ fontSize: 10, color: '#3f3f46' }}>
                        {eventDateTime}
                      </span>
                      <span className={`mc-badge ${t.cls}`}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                        {status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setEditingEventId(event.id)}
                        className="mc-mono"
                        style={{
                          fontSize: 9,
                          padding: '4px 6px',
                          color: '#3b82f6',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '4px',
                          background: 'rgba(59,130,246,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          const elem = e.currentTarget as HTMLButtonElement
                          elem.style.background = 'rgba(59,130,246,0.12)'
                          elem.style.borderColor = 'rgba(59,130,246,0.5)'
                        }}
                        onMouseLeave={(e) => {
                          const elem = e.currentTarget as HTMLButtonElement
                          elem.style.background = 'rgba(59,130,246,0.05)'
                          elem.style.borderColor = 'rgba(59,130,246,0.3)'
                        }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="mc-mono"
                        style={{
                          fontSize: 9,
                          padding: '4px 6px',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '4px',
                          background: 'rgba(239,68,68,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          const elem = e.currentTarget as HTMLButtonElement
                          elem.style.background = 'rgba(239,68,68,0.12)'
                          elem.style.borderColor = 'rgba(239,68,68,0.5)'
                        }}
                        onMouseLeave={(e) => {
                          const elem = e.currentTarget as HTMLButtonElement
                          elem.style.background = 'rgba(239,68,68,0.05)'
                          elem.style.borderColor = 'rgba(239,68,68,0.3)'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {editingEventId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }} onClick={() => setEditingEventId(null)}>
          <div style={{
            background: '#0f0f0f',
            border: '1px solid rgba(39,39,42,0.5)',
            borderRadius: 12,
            padding: 20,
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="mc-mono" style={{ fontSize: 14, color: '#d4d4d8' }}>EDIT_EVENT</h2>
              <button
                onClick={() => setEditingEventId(null)}
                className="mc-mono"
                style={{
                  fontSize: 16,
                  color: '#52525b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <AddEvent eventId={editingEventId} onEventAdded={() => {
              setEditingEventId(null)
              setRefreshTrigger(prev => prev + 1)
            }} />
          </div>
        </div>
      )}
    </>
  )
}