# Auto-Send System Overview Feature

## Overview
When a user loads the AI chat page with no prior messages, NOVA automatically sends a system overview query and displays the response. This happens exactly once per session.

## Behavior

### Trigger Conditions
✅ **All must be true**:
1. `autoSentOnce === false` (hasn't triggered yet)
2. `conversationId !== null` (conversation initialized)
3. `messages.length === 1` (only greeting message, no prior messages from DB)
4. `loading === false` (not currently processing)

### What Happens
1. **Auto Query Sent**: "give me a quick overview of my system"
2. **Flag Set**: `autoSentOnce = true` (prevents re-triggering)
3. **Response Streamed**: AI response displays with typing animation
4. **Data Saved**: Query and response both saved to Supabase
5. **UI Updated**: Messages appear in chat naturally

### Timing
- Detects "no messages" after database fetch completes
- 300ms delay before sending (lets UI settle)
- Once per session (localStorage conversation ID persists across reloads)

## User Experience

### New Conversation (First Visit)
```
[Page loads]
   ↓
[NOVA greeting appears]
   ↓
[Auto-query triggers]
   ↓
[NOVA responds with system overview]
   ↓
[User can continue chatting]
```

### Returning to Same Conversation
```
[Page loads]
[Loads conversation from localStorage]
   ↓
[Fetches existing messages from DB]
   ↓
[shows all prior chat history]
   ↓
[NO auto-send (messages.length > 1)]
```

## Implementation Details

### Key State Variable
```typescript
const [autoSentOnce, setAutoSentOnce] = useState(false)
```
- Scoped to component (resets on page reload)
- Prevents infinite loops
- Works per-session

### Detection useEffect
```typescript
useEffect(() => {
  if (!autoSentOnce && conversationId && messages.length === 1 && !loading) {
    console.log('🤖 No messages found, triggering auto query...')
    setAutoSentOnce(true)
    setTimeout(() => {
      sendAutoQuery('give me a quick overview of my system')
    }, 300)
  }
}, [autoSentOnce, conversationId, messages.length, loading])
```

**Depends on**:
- `autoSentOnce` - control flag
- `conversationId` - conversation ready
- `messages.length` - message count
- `loading` - not processing

### Query Execution
```typescript
const sendAutoQuery = async (userMessage: string) => {
  // 1. Add user message to UI
  // 2. Save user message to DB
  // 3. Fetch AI response from /api/ai
  // 4. Stream response with typing effect
  // 5. Save AI response to DB
}
```

**Reuses same logic as manual send but**:
- Called programmatically
- No input field needed
- Fully automatic

## Code Changes

### File: `/apps/web/app/ai/page.tsx`

**Added State:**
```typescript
const [autoSentOnce, setAutoSentOnce] = useState(false)
```

**Added Function: `sendAutoQuery()`**
- Lines: ~348-421
- Extracts core send logic for reuse
- Handles message insertion, DB save, streaming, response save
- Used by both auto-send and manual send

**Added useEffect: Auto-Send Trigger**
- Lines: ~423-431
- Monitors: autoSentOnce, conversationId, messages.length, loading
- Triggers sendAutoQuery() with 300ms delay
- Sets autoSentOnce flag to prevent re-runs

**Updated Function: `send()`**
- Now simplified to use existing input
- Delegates core logic to sendAutoQuery()
- Still handles manual input from user

## Database Operations

### Saved to Supabase (`messages` table):

**User Message:**
```json
{
  "conversation_id": "uuid-...",
  "role": "user",
  "content": "give me a quick overview of my system"
}
```

**AI Response:**
```json
{
  "conversation_id": "uuid-...",
  "role": "assistant",
  "content": "[NOVA's system overview response]"
}
```

Both are queryable and persist across sessions.

## Session Lifecycle

### Session 1 (New User)
1. Load page
2. Create new conversation
3. Store conversation ID in localStorage
4. No messages in DB yet
5. **→ Auto-send triggers**
6. User sees AI overview
7. Can continue chatting

### Session 2 (Same Day, Same Browser)
1. Load page
2. Load conversation from localStorage (same ID)
3. Fetch messages from DB (finds the overview conversation)
4. messages.length = 3+ (greeting + user query + AI response + any new)
5. **→ Auto-send does NOT trigger** (messages.length !== 1)
6. Shows full conversation history
7. Can continue chatting

### Session 3 (New Browser/Clear Cache)
1. Load page
2. No conversation in localStorage
3. Create NEW conversation (new ID)
4. No messages in DB yet
5. **→ Auto-send triggers again** (new session)
6. User sees AI overview again
7. Conversation saved to this new ID

## Benefits

✅ **First-Time Experience**: Immediate helpful system overview  
✅ **Onboarding**: Shows NOVA's capabilities naturally  
✅ **Smart Context**: User gets relevant insights about their system  
✅ **Non-Intrusive**: Only happens once, doesn't interrupt returning users  
✅ **Persistent**: Saves to database for future reference  
✅ **Preventative**: Catches the "I'm not sure what to ask" moment  

## Testing Scenarios

### Test 1: New Conversation
1. Clear browser localStorage
2. Refresh `/ai` page
3. ✅ Should auto-send query
4. ✅ Should see system overview

### Test 2: Returning User
1. Refresh same `/ai` page (without clearing cache)
2. ✅ Should NOT auto-send
3. ✅ Should show conversation history

### Test 3: Manual Override
1. User can type their own query while auto-send is processing
2. ✅ Manual send takes priority (when input is filled)

### Test 4: Error Handling
1. If API fails
2. ✅ Shows error message: "ERR: Signal lost..."
3. ✅ User can retry manually

## Configuration

If you want to change the auto-query, edit this line:
```typescript
sendAutoQuery('give me a quick overview of my system')
```

To send a different query:
```typescript
sendAutoQuery('What are my top priorities?')
sendAutoQuery('Summarize my active projects')
sendAutoQuery('What should I focus on today?')
```

## Git Commit

```
commit d5e56f3
feat: auto-send system overview query on page load

- Auto-sends 'give me a quick overview of my system' when:
  - No messages exist in conversation (new session)
  - Conversation initialized and ready
  - Only triggers once per session (autoSentOnce flag)
- Extracts send logic into reusable sendAutoQuery function
- Displays AI response with streaming animation
- Saves both user query and AI response to database
```

## Related Features
- **Insights Display**: Shows 4 types of contextual alerts above chat
- **Message Persistence**: All queries and responses saved to Supabase
- **Action Execution**: AI can create tasks/events
- **Streaming Response**: Animated typing effect for AI output