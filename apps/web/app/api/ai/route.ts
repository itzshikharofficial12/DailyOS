import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

// Initialize Groq only if API key exists
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Generate insights from user data
function generateInsights(tasks: any[], events: any[], projects: any[], ideas: any[]): string[] {
  const insights: string[] = []

  // 1. Tasks insight
  const pendingTasks = tasks?.filter((t: any) => !t.done) || []
  if (pendingTasks.length > 0) {
    insights.push(`📋 You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}. Start by focusing on the most important one.`)
  }

  // 2. Events insight - check for upcoming event within 1 hour
  if (events && events.length > 0) {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    
    const upcomingEvent = events.find((e: any) => {
      const eventTime = new Date(e.datetime)
      return eventTime > now && eventTime <= oneHourLater
    })

    if (upcomingEvent) {
      const eventTime = new Date(upcomingEvent.datetime)
      const timeUntil = Math.round((eventTime.getTime() - now.getTime()) / 60000)
      insights.push(`⏰ Alert: "${upcomingEvent.title}" in ${timeUntil} minute${timeUntil > 1 ? 's' : ''}.`)
    }
  }

  // 3. Projects insight
  const activeProjects = projects?.filter((p: any) => p.status === 'active') || []
  if (activeProjects.length > 0) {
    insights.push(`🚀 ${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''} in progress.`)
  }

  // 4. Ideas insight
  if (ideas && ideas.length > 0) {
    insights.push(`💡 ${ideas.length} idea${ideas.length > 1 ? 's' : ''} waiting to be converted into tasks.`)
  }

  return insights
}

// Detect and extract user identity information from message
async function detectAndStoreIdentity(message: string) {
  // Pattern: "my name is X" or "I'm X" or "I am X"
  const namePatterns = [
    /my name is ([a-zA-Z\s]+?)(?:\.|,|$)/i,
    /i(?:'m| am) ([a-zA-Z\s]+?)(?:\.|,|$)/i,
    /call me ([a-zA-Z\s]+?)(?:\.|,|$)/i,
  ]

  for (const pattern of namePatterns) {
    const match = message.match(pattern)
    if (match) {
      const name = match[1].trim()
      const key = 'name'
      const value = name
      
      console.log(`👤 Detected name: ${name}`)
      console.log('Saving memory:', key, value)
      
      try {
        // Insert into user_memory table
        const { data, error } = await supabase
          .from('user_memory')
          .upsert(
            { 
              key: key, 
              value: value, 
              updated_at: new Date().toISOString() 
            },
            { onConflict: 'key' }
          )
          .select()

        if (error) {
          console.error('❌ Error storing memory:', error.message)
        } else {
          console.log('✓ Memory saved to user_memory:', { key, value })
        }
      } catch (err) {
        console.error('❌ Error in detectAndStoreIdentity:', err)
      }
      
      return name
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json()

    console.log('Sending message:', message)
    console.log('Conversation ID:', conversationId)
    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY)

    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
      })
    }

    // Detect and store user identity information
    await detectAndStoreIdentity(message)

    // Handle GET_INSIGHTS request
    if (message === 'GET_INSIGHTS') {
      // Fetch all data for insights
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('datetime', { ascending: true })

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')

      const { data: projects } = await supabase
        .from('projects')
        .select('*')

      const { data: ideas } = await supabase
        .from('ideas')
        .select('*')

      const insightsList = generateInsights(tasks || [], events || [], projects || [], ideas || [])

      return new Response(
        JSON.stringify({ insights: insightsList }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500 }
      )
    }

    // Fetch events from Supabase
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('datetime', { ascending: true })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
    }

    // Fetch tasks from Supabase
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
    }

    // Fetch projects from Supabase
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
    }

    // Fetch ideas from Supabase
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')

    if (ideasError) {
      console.error('Error fetching ideas:', ideasError)
    }

    // Convert events into readable text
    const eventContext = events && events.length > 0
      ? events.map((e: any) =>
          `${e.title} at ${e.datetime ? new Date(e.datetime).toLocaleTimeString() : 'No time'}`
        ).join('\n')
      : 'None'

    // Convert tasks into readable text
    const taskContext = tasks && tasks.length > 0
      ? tasks.map((t: any) =>
          `${t.text} (${t.done ? 'done' : 'pending'})`
        ).join('\n')
      : 'None'

    // Convert projects into readable text
    const projectContext = projects && projects.length > 0
      ? projects.map((p: any) =>
          `${p.title} (${p.status})`
        ).join('\n')
      : 'None'

    // Convert ideas into readable text
    const ideaContext = ideas && ideas.length > 0
      ? ideas.map((i: any) =>
          `${i.text}`
        ).join('\n')
      : 'None'

    console.log('Event context:', eventContext)
    console.log('Task context:', taskContext)
    console.log('Project context:', projectContext)
    console.log('Idea context:', ideaContext)

    // Fetch last 10 messages from conversation for context
    let conversationMessages: any[] = []
    if (conversationId) {
      const { data: dbMessages, error: messagesError } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10)

      if (messagesError) {
        console.error('Error fetching conversation messages:', messagesError)
      } else {
        conversationMessages = dbMessages || []
        console.log(`📬 Fetched ${conversationMessages.length} messages from conversation`)
      }
    }

    // Build messages array: past messages + current user message
    const messagesForAI: any[] = [
      ...conversationMessages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    console.log(`📨 Sending ${messagesForAI.length} messages to AI (including current)`)

    // Fetch user memory for context
    let memoryContext = ''
    try {
      const { data: memory, error: memoryError } = await supabase
        .from('user_memory')
        .select('*')

      if (memoryError) {
        console.error('Error fetching user memory:', memoryError)
      } else if (memory && memory.length > 0) {
        memoryContext = memory
          .map((m: any) => `${m.key}: ${m.value}`)
          .join('\n')
        console.log(`📝 User memory:\n${memoryContext}`)
      } else {
        console.log('ℹ No user memory stored yet')
      }
    } catch (err) {
      console.error('Error in memory fetch:', err)
    }

    if (!groq) {
      return Response.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are NOVA, an AI assistant.

You have access to user memory.

User memory:
${memoryContext || 'None'}

Rules:
- ALWAYS use memory when answering
- NEVER say "no data available" if memory exists
- If user asks about themselves → use memory
- Keep response short

You can perform actions.

If user asks to create something, respond ONLY in JSON format:

Examples:

Create task:
{
  "action": "create_task",
  "data": {
    "title": "Finish backend"
  }
}

Create event:
{
  "action": "create_event",
  "data": {
    "title": "Meeting",
    "datetime": "2026-04-12T17:00:00"
  }
}

Otherwise:
- respond normally (short text)

Do not explain JSON
Do not mix text + JSON

User context:

EVENTS:
${eventContext}

TASKS:
${taskContext}

PROJECTS:
${projectContext}

IDEAS:
${ideaContext}`,
        },
        ...(messagesForAI as any[]),
      ],
    })

    const reply = completion.choices[0]?.message?.content

    console.log('AI reply:', reply)

    return new Response(JSON.stringify({ reply }), {
      status: 200,
    })
  } catch (error: any) {
    console.error('GROQ ERROR:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message)
    console.error('Error string:', String(error))

    const errorMessage =
      error?.message ||
      (typeof error === 'string' ? error : 'Internal server error')

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: String(error),
      }),
      { status: 500 }
    )
  }
}
