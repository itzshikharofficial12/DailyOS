'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

const NOVA_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .nova-wrap {
    font-family: 'Syne', sans-serif;
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 18px 0' }}>
          <div className="nova-dot" style={{ background: loading ? '#f59e0b' : '#22c55e', width: 4, height: 4 }} />
          <span className="nova-mono" style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.1em' }}>
            {loading ? 'NOVA PROCESSING...' : 'READY FOR INPUT'}
          </span>
          <div style={{ width: 1, height: 7, background: '#1f1f23' }} />
          <span className="nova-mono" style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.08em' }}>ENTER TO SEND</span>round: #09090b;
    color: #e4e4e7;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .nova-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.025) 2px,
      rgba(0,0,0,0.025) 4px
    );
    pointer-events: none;
    z-index: 999;
  }

  .nova-mono { font-family: 'JetBrains Mono', monospace !important; }

  @keyframes nova-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(0.8); }
  }
  .nova-dot {
    border-radius: 50%;
    animation: nova-pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes nova-ring     { to { transform: rotate(360deg);  } }
  @keyframes nova-ring-rev { to { transform: rotate(-360deg); } }
  .nova-ring-spin     { animation: nova-ring     8s linear infinite; }
  .nova-ring-spin-rev { animation: nova-ring-rev 12s linear infinite; }

  @keyframes nova-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .nova-cursor {
    display: inline-block;
    width: 2px; height: 14px;
    background: #3b82f6;
    border-radius: 1px;
    animation: nova-blink 1s infinite;
    vertical-align: middle;
    margin-left: 3px;
  }

  @keyframes nova-think {
    0%, 100% { opacity: 0.15; transform: translateY(0);    }
    50%       { opacity: 1;    transform: translateY(-3px); }
  }

  @keyframes nova-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .nova-msg-in { animation: nova-fadein 0.2s ease forwards; }

  .nova-bubble-ai {
    background: rgba(9,9,11,0.95);
    border: 1px solid rgba(39,39,42,0.9);
    border-radius: 2px 10px 10px 10px;
    position: relative;
  }
  .nova-bubble-ai::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(59,130,246,0.025) 0%, transparent 55%);
    border-radius: inherit;
    pointer-events: none;
  }
  .nova-bubble-user {
    background: rgba(29,78,216,0.1);
    border: 1px solid rgba(59,130,246,0.18);
    border-radius: 10px 2px 10px 10px;
  }

  .nova-messages::-webkit-scrollbar { width: 3px; }
  .nova-messages::-webkit-scrollbar-track { background: transparent; }
  .nova-messages::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }
  .nova-messages::-webkit-scrollbar-thumb:hover { background: #3b82f6; }

  .nova-input-el {
    flex: 1;
    background: rgba(9,9,11,0.85);
    border: 1px solid rgba(39,39,42,0.8);
    border-radius: 0 7px 7px 0;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #e4e4e7;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .nova-input-el::placeholder { color: #71717a; }
  .nova-input-el:focus {
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.05);
  }
  .nova-input-el:disabled { opacity: 0.4; cursor: not-allowed; }

  .nova-send-btn {
    padding: 10px 18px;
    background: #1d4ed8;
    border: 1px solid rgba(59,130,246,0.35);
    border-radius: 7px;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
    flex-shrink: 0;
  }
  .nova-send-btn:hover:not(:disabled) {
    background: #2563eb;
    border-color: rgba(96,165,250,0.5);
    box-shadow: 0 0 16px rgba(59,130,246,0.3);
  }
  .nova-send-btn:disabled {
    background: rgba(39,39,42,0.5);
    border-color: rgba(63,63,70,0.3);
    color: #3f3f46;
    cursor: not-allowed;
  }

  .nc { position: absolute; width: 7px; height: 7px; }
  .nc-tl { top:0; left:0;  border-top:1px solid rgba(59,130,246,0.3); border-left:1px solid rgba(59,130,246,0.3);  border-radius:2px 0 0 0; }
  .nc-tr { top:0; right:0; border-top:1px solid rgba(59,130,246,0.3); border-right:1px solid rgba(59,130,246,0.3); border-radius:0 2px 0 0; }
  .nc-bl { bottom:0; left:0;  border-bottom:1px solid rgba(59,130,246,0.3); border-left:1px solid rgba(59,130,246,0.3);  border-radius:0 0 0 2px; }
  .nc-br { bottom:0; right:0; border-bottom:1px solid rgba(59,130,246,0.3); border-right:1px solid rgba(59,130,246,0.3); border-radius:0 0 2px 0; }

  .nova-suggest-btn {
    padding: 6px 12px;
    background: rgba(9,9,11,0.8);
    border: 1px solid rgba(39,39,42,0.8);
    border-radius: 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #71717a;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .nova-suggest-btn:hover {
    border-color: rgba(59,130,246,0.3);
    color: #a1a1aa;
  }
`

const SUGGESTED = [
  'What should I focus on today?',
  'Summarize my active projects',
  'Help me write a PR description',
  'Plan a deep work session',
]

function NovaAvatar({ size = 34, active = false }: { size?: number; active?: boolean }) {
  const c = size / 2
  const r1 = c - 3
  const r2 = c - 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g className="nova-ring-spin" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={r1} fill="none" stroke="rgba(59,130,246,0.18)" strokeWidth="1" strokeDasharray="3 5" />
      </g>
      <g className="nova-ring-spin-rev" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={r2} fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1" strokeDasharray="2 7" />
      </g>
      <circle cx={c} cy={c} r={c - 13} fill="rgba(29,78,216,0.12)" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <text x={c} y={c + 4} textAnchor="middle" fill="#60a5fa"
        style={{ fontSize: size * 0.28, fontFamily: 'JetBrains Mono,monospace', fontWeight: 600 }}>
        N
      </text>
      {active && <circle cx={c + r1 * 0.68} cy={c - r1 * 0.68} r="2.5" fill="#22c55e" />}
    </svg>
  )
}

function ThinkingBubble() {
  return (
    <div className="nova-msg-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <NovaAvatar size={28} active />
      <div className="nova-bubble-ai" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="nova-mono" style={{ fontSize: 8, color: '#3f3f46', marginRight: 4, letterSpacing: '0.1em' }}>PROCESSING</span>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%', background: '#3b82f6',
            animation: 'nova-think 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1', type: 'ai',
    content: "NOVA online. Neural systems initialized. I'm your mission-aware AI — wired into your projects, tasks, and goals. How can I assist?",
    timestamp: new Date(),
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [insights, setInsights] = useState<string[]>([])
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  // Initialize conversation on page load
  const createNewConversation = async () => {
    try {
      const { data, error } = await supabase!
        .from('conversations')
        .insert([{}])
        .select()

      if (error) {
        console.error('❌ Error creating conversation:', error.message)
        return
      }

      if (data && data[0]) {
        const id = data[0].id
        console.log('✓ Conversation created:', id)
        localStorage.setItem('nova_conversation_id', id)
        setConversationId(id)
      }
    } catch (err) {
      console.error('❌ Error initializing conversation:', err)
    }
  }

  // Initialize conversation on page load - load from localStorage or create new
  useEffect(() => {
    const initializeConversation = async () => {
      const existingId = localStorage.getItem('nova_conversation_id')

      if (existingId) {
        console.log('✓ Loaded conversationId from localStorage:', existingId)
        setConversationId(existingId)
      } else {
        console.log('→ Creating new conversation...')
        await createNewConversation()
      }

      // Mark initialization as complete
      setIsInitializing(false)
    }

    initializeConversation()
  }, [])

  // Fetch messages from database when conversation ID is set
  useEffect(() => {
    const fetchMessages = async () => {
      // Don't fetch until initialization is complete AND conversationId is set
      if (isInitializing || !conversationId) {
        console.log('⏳ Waiting for initialization... isInitializing:', isInitializing, 'conversationId:', conversationId)
        return
      }

      console.log('→ Fetching messages for conversation:', conversationId)
      console.log('conversationId:', conversationId)

      const { data, error } = await supabase!
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching messages:', error.message)
        console.log('Insert error:', error)
        return
      }

      console.log('Fetch result:', data)

      if (data && data.length > 0) {
        // Map DB messages to UI format
        const fetchedMessages: Message[] = data.map((m: any) => ({
          id: m.id,
          type: m.role === 'assistant' ? 'ai' : 'user',
          content: m.content,
          timestamp: new Date(m.created_at),
        }))

        console.log('✓ Fetched', fetchedMessages.length, 'messages from database')
        console.log('→ First message:', fetchedMessages[0]?.content.substring(0, 50))
        console.log('→ Last message:', fetchedMessages[fetchedMessages.length - 1]?.content.substring(0, 50))

        setMessages(fetchedMessages)
      } else {
        console.log('ℹ No previous messages found for this conversation')
        // Keep the greeting message if no prior messages exist
      }
    }

    fetchMessages()
  }, [conversationId, isInitializing])

  useEffect(() => {
    const t = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    setTime(t)
  }, [])

  // Fetch insights when component mounts
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'GET_INSIGHTS' }),
        })
        const data = await response.json()
        if (data.insights && Array.isArray(data.insights)) {
          setInsights(data.insights)
        }
      } catch (err) {
        console.error('Error fetching insights:', err)
      }
    }
    fetchInsights()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    if (!conversationId) {
      console.warn('❌ Cannot send - conversation ID not ready')
      return
    }
    
    const userMessage = input
    const userMsg: Message = { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)

    // Insert user message into database
    ;(async () => {
      try {
        // Validate conversationId before saving
        if (!conversationId || conversationId.startsWith('local_')) {
          console.error('Invalid conversationId:', conversationId)
          return
        }

        console.log('conversationId:', conversationId)
        console.log('Saving message:', userMessage)
        
        const { error } = await supabase!.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage,
        })

        if (error) {
          console.error('❌ User message save failed:', error.message)
          console.log('Insert error:', error)
        } else {
          console.log('✓ User message saved to DB')
        }
      } catch (err) {
        console.error('Error saving user message:', err)
      }
    })()

    const aiMsg: Message = { id: (Date.now()+1).toString(), type: 'ai', content: '', timestamp: new Date() }
    setMessages(p => [...p, aiMsg])

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversationId }),
      })
      if (!res.ok) throw new Error('API error')
      const { reply } = await res.json()
      
      // Try to parse as JSON action
      let isAction = false
      try {
        const parsed = JSON.parse(reply)
        
        if (parsed.action === 'create_task' && parsed.data?.title) {
          console.log('🔧 Creating task:', parsed.data.title)
          isAction = true
          
          const { error } = await supabase!
            .from('tasks')
            .insert({
              text: parsed.data.title,
              done: false,
            })
          
          if (error) {
            console.error('❌ Failed to create task:', error.message)
            const confirmation = `❌ Failed to create task: ${parsed.data.title}`
            setMessages(p => {
              const u = [...p]
              const last = u[u.length - 1]
              if (last.type === 'ai') last.content = confirmation
              return u
            })
            // Save confirmation to DB
            if (conversationId && !conversationId.startsWith('local_')) {
              ;(async () => {
                try {
                  await supabase!.from('messages').insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: confirmation,
                  })
                  console.log('✓ Failure confirmation saved to DB')
                } catch (err) {
                  console.error('Error saving confirmation:', err)
                }
              })()
            }
          } else {
            console.log('✓ Task created successfully')
            const confirmation = `✓ Task created: ${parsed.data.title}`
            setMessages(p => {
              const u = [...p]
              const last = u[u.length - 1]
              if (last.type === 'ai') last.content = confirmation
              return u
            })
            // Save confirmation to DB
            if (conversationId && !conversationId.startsWith('local_')) {
              ;(async () => {
                try {
                  await supabase!.from('messages').insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: confirmation,
                  })
                  console.log('✓ Task creation confirmation saved to DB')
                } catch (err) {
                  console.error('Error saving confirmation:', err)
                }
              })()
            }
          }
        }
        
        if (parsed.action === 'create_event' && parsed.data?.title && parsed.data?.datetime) {
          console.log('🔧 Creating event:', parsed.data.title)
          isAction = true
          
          const { error } = await supabase!
            .from('events')
            .insert({
              title: parsed.data.title,
              datetime: parsed.data.datetime,
            })
          
          if (error) {
            console.error('❌ Failed to create event:', error.message)
            const confirmation = `❌ Failed to create event: ${parsed.data.title}`
            setMessages(p => {
              const u = [...p]
              const last = u[u.length - 1]
              if (last.type === 'ai') last.content = confirmation
              return u
            })
            // Save confirmation to DB
            if (conversationId && !conversationId.startsWith('local_')) {
              ;(async () => {
                try {
                  await supabase!.from('messages').insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: confirmation,
                  })
                  console.log('✓ Failure confirmation saved to DB')
                } catch (err) {
                  console.error('Error saving confirmation:', err)
                }
              })()
            }
          } else {
            console.log('✓ Event created successfully')
            const confirmation = `✓ Event created: ${parsed.data.title}`
            setMessages(p => {
              const u = [...p]
              const last = u[u.length - 1]
              if (last.type === 'ai') last.content = confirmation
              return u
            })
            // Save confirmation to DB
            if (conversationId && !conversationId.startsWith('local_')) {
              ;(async () => {
                try {
                  await supabase!.from('messages').insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: confirmation,
                  })
                  console.log('✓ Event creation confirmation saved to DB')
                } catch (err) {
                  console.error('Error saving confirmation:', err)
                }
              })()
            }
          }
        }
      } catch (e) {
        // Not JSON, treat as normal message
        console.log('→ Normal message response')
      }
      
      // If not an action, stream the response normally
      // (Actions have confirmations saved separately above)
      if (!isAction) {
        let i = 0
        const iv = setInterval(() => {
          i++
          const text = reply.substring(0, i)
          setMessages(p => {
            const u = [...p]
            const last = u[u.length - 1]
            if (last.type === 'ai') last.content = text
            return u
          })
          if (i >= reply.length) { 
            clearInterval(iv)
            setLoading(false)
            
            // Insert AI response into database after streaming is complete
            // Skip saving if this was an action (JSON response)
            if (conversationId) {
              ;(async () => {
                try {
                  // Validate conversationId before saving
                  if (!conversationId || conversationId.startsWith('local_')) {
                    console.error('Invalid conversationId:', conversationId)
                    return
                  }

                  console.log('conversationId:', conversationId)
                  console.log('Saving message:', reply)
                  
                  const { error } = await supabase!.from('messages').insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: reply,
                  })

                  if (error) {
                    console.error('❌ AI message save failed:', error.message)
                    console.log('Insert error:', error)
                  } else {
                    console.log('✓ AI message saved to DB')
                  }
                } catch (err) {
                  console.error('Error saving AI message:', err)
                }
              })()
            }
          }
        }, 18)
      } else {
        // Action was handled, confirmation already saved to DB above
        console.log('→ Action handled - raw JSON not saved to DB')
        setLoading(false)
      }
    } catch {
      setMessages(p => {
        const u = [...p]
        const last = u[u.length - 1]
        if (last.type === 'ai') last.content = 'ERR: Signal lost. Failed to reach inference endpoint. Please retry.'
        return u
      })
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="nova-wrap">
      <style>{NOVA_STYLES}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px',
        borderBottom: '1px solid rgba(39,39,42,0.8)',
        background: 'rgba(9,9,11,0.97)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="nc nc-tl" /><div className="nc nc-tr" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NovaAvatar size={34} active />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.01em' }}>NOVA</span>
              <span className="nova-mono" style={{ fontSize: 8, color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 3, padding: '1px 5px', letterSpacing: '0.1em' }}>v2.1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div className="nova-dot" style={{ background: '#22c55e', width: 4, height: 4 }} />
              <span className="nova-mono" style={{ fontSize: 9, color: '#71717a' }}>NEURAL LINK ACTIVE</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { label: 'MODEL',   value: 'GROQ'              },
            { label: 'SESSION', value: `${messages.length} MSG` },
            { label: 'TIME',    value: time || '...'        },
          ].map(s => (
            <div key={s.label}>
              <div className="nova-mono" style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.1em' }}>{s.label}</div>
              <div className="nova-mono" style={{ fontSize: 11, color: '#71717a' }}>{s.value}</div>
            </div>
          ))}
          <div style={{ width: 1, height: 20, background: '#1f1f23' }} />
          <button
            onClick={() => setMessages([{ id: '1', type: 'ai', content: 'Session cleared. NOVA ready.', timestamp: new Date() }])}
            className="nova-mono"
            style={{ padding: '4px 9px', background: 'rgba(39,39,42,0.5)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 4, fontSize: 9, color: '#71717a', cursor: 'pointer', letterSpacing: '0.08em', transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
          >CLR</button>
        </div>
      </div>

      {/* ── MESSAGES — only this scrolls ── */}
      <div
        className="nova-messages"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── INSIGHTS CARD ── */}
          {insights.length > 0 && (
            <div className="nova-msg-in" style={{
              background: 'rgba(24,24,27,0.8)',
              border: '1px solid rgba(39,39,42,0.8)',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <span className="nova-mono" style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.12em' }}>ACTIVE INSIGHTS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {insights.map((insight, idx) => (
                  <div key={idx} className="nova-mono" style={{ fontSize: 11, color: '#a1a1aa', lineHeight: 1.5 }}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="nova-msg-in" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span className="nova-mono" style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.12em' }}>SUGGESTED QUERIES</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUGGESTED.map(s => (
                  <button key={s} className="nova-suggest-btn" onClick={() => { setInput(s); inputRef.current?.focus() }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isStreaming = loading && idx === messages.length - 1 && msg.type === 'ai'
            return (
              <div
                key={msg.id}
                className="nova-msg-in"
                style={{
                  display: 'flex',
                  flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {msg.type === 'ai' ? (
                  <NovaAvatar size={28} active={isStreaming} />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="nova-mono" style={{ fontSize: 9, color: '#60a5fa' }}>U</span>
                  </div>
                )}

                <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="nova-mono" style={{
                    fontSize: 9, color: '#52525b', letterSpacing: '0.12em',
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    {msg.type === 'ai' ? 'NOVA' : 'YOU'} · {time || '...'}
                  </span>
                  <div className={msg.type === 'ai' ? 'nova-bubble-ai' : 'nova-bubble-user'} style={{ padding: '10px 13px', wordBreak: 'break-word' }}>
                    {msg.type === 'ai' && msg.content && (
                      <span className="nova-mono" style={{ fontSize: 9, color: '#3b82f6', marginRight: 7, letterSpacing: '0.08em' }}>NOVA ▸</span>
                    )}
                    <span className="nova-mono" style={{ fontSize: 13, color: msg.type === 'ai' ? '#d4d4d8' : '#c4d4f8', lineHeight: 1.75 }}>
                      {msg.content}
                    </span>
                    {isStreaming && msg.content && <span className="nova-cursor" />}
                  </div>
                </div>
              </div>
            )
          })}

          {loading && messages[messages.length - 1]?.content === '' && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT — always visible at bottom ── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(39,39,42,0.8)',
        background: 'rgba(9,9,11,0.97)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="nc nc-tl" /><div className="nc nc-tr" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 18px 0' }}>
          <div className="nova-dot" style={{ background: loading ? '#f59e0b' : '#22c55e', width: 4, height: 4 }} />
          <span className="nova-mono" style={{ fontSize: 7, color: '#27272a', letterSpacing: '0.1em' }}>
            {loading ? 'NOVA PROCESSING...' : 'READY FOR INPUT'}
          </span>
          <div style={{ width: 1, height: 7, background: '#1f1f23' }} />
          <span className="nova-mono" style={{ fontSize: 7, color: '#1f1f23' }}>ENTER TO SEND</span>
        </div>

        <div style={{ padding: '8px 18px 14px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: 820, margin: '0 auto' }}>
            <div className="nova-mono" style={{
              padding: '10px 9px',
              background: 'rgba(39,39,42,0.4)',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRight: 'none',
              borderRadius: '7px 0 0 7px',
              fontSize: 11, color: '#3b82f6', flexShrink: 0,
            }}>▶</div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Send a transmission to NOVA..."
              disabled={loading}
              className="nova-input-el"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="nova-send-btn">
              <span>▶</span> TRANSMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}