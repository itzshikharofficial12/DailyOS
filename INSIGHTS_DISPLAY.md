# Insights Display Card

## Overview
Added a clean, minimal insights card that displays above the chat messages. Shows intelligent alerts about pending tasks, upcoming events, active projects, and ideas.

## Visual Design
- **Position**: Above chat messages (below header, above suggested queries)
- **Styling**:
  - Dark background: `rgba(24,24,27,0.8)` (zinc-900)
  - Border: `1px solid rgba(39,39,42,0.8)`
  - Border radius: `6px`
  - Padding: `10px 12px`
  - Font: JetBrains Mono
  - Text size: `text-xs` (8px) for label, `text-sm` (11px) for insights
  - Text color: `#a1a1aa` (zinc-400)

## Example Output
```
ACTIVE INSIGHTS
📋 You have 3 pending tasks. Start by focusing on the most important one.
⏰ Alert: "Meeting" in 30 minutes.
🚀 2 active projects in progress.
💡 2 ideas waiting to be converted into tasks.
```

## Implementation Details

### Frontend (`/apps/web/app/ai/page.tsx`)
- Added `insights` state: `const [insights, setInsights] = useState<string[]>([])`
- Added `useEffect` to fetch insights on mount
- Fetches from `/api/ai` with message: `GET_INSIGHTS`
- Displays insights card conditionally (`{insights.length > 0 && ...}`)

### Backend (`/apps/web/app/api/ai/route.ts`)
- Added special handler for `message === 'GET_INSIGHTS'`
- Fetches tasks, events, projects, ideas from Supabase
- Calls `generateInsights()` function with aggregated data
- Returns JSON: `{ insights: string[] }`

### Insights Logic
The `generateInsights()` function generates 4 types of insights:

1. **Pending Tasks**: Counts incomplete tasks (`done === false`)
   - Output: `📋 You have X pending task(s). Start by focusing on the most important one.`

2. **Upcoming Events**: Finds events within 1 hour window
   - Output: `⏰ Alert: "Event Title" in X minute(s).`

3. **Active Projects**: Filters projects with `status === 'active'`
   - Output: `🚀 X active project(s) in progress.`

4. **Ideas**: Counts all ideas awaiting conversion
   - Output: `💡 X idea(s) waiting to be converted into tasks.`

## Usage
The insights card automatically appears when there are insights to display. No manual refresh needed - it loads on page mount and can be updated by calling the insights endpoint again.

## Styling Consistency
- Matches NOVA interface aesthetic (dark, minimal, monospace)
- Uses `nova-mono` class for JetBrains Mono font
- Uses `nova-msg-in` class for fade-in animation
- Follows existing color palette (zinc-900, zinc-500, zinc-400)

## Future Enhancements
- Refresh insights on interval (e.g., every 5 minutes)
- Click insights to navigate to relevant sections
- Animated updates when insights change
- Dismissible insights with "X" button
