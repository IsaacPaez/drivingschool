# Server-Sent Events (SSE) Implementation

## Overview

This document describes the implementation of Server-Sent Events (SSE) to replace the polling mechanism in the Book-Now feature. The new system provides real-time updates without constant API calls.

## Architecture

### Components

1. **SSE Endpoint**: `/api/book-now/schedule-updates`
2. **SSE Manager**: `lib/sseManager.ts`
3. **Custom Hook**: `hooks/useScheduleSSE.ts`
4. **Updated Component**: `app/Book-Now/page.tsx`

### How it Works

1. **Connection Setup**: When a user selects an instructor, the frontend establishes an SSE connection
2. **Initial Data**: The server sends the current schedule immediately upon connection
3. **Real-time Updates**: MongoDB change streams monitor database changes and broadcast updates to all connected clients
4. **Automatic Reconnection**: The SSE connection automatically reconnects if disconnected

## Benefits

- **Reduced Server Load**: No more constant polling every 5 seconds
- **Real-time Updates**: Instant updates when bookings are made or cancelled
- **Better User Experience**: Live connection status indicator
- **Scalable**: Efficiently handles multiple concurrent users

## Implementation Details

### SSE Endpoint (`/api/book-now/schedule-updates`)

```typescript
// Establishes SSE connection
// Sends initial schedule data
// Registers client with SSE manager
// Handles client disconnection
```

### SSE Manager (`lib/sseManager.ts`)

```typescript
// Manages all SSE connections
// Sets up MongoDB change streams per instructor
// Broadcasts updates to relevant clients
// Cleans up connections when clients disconnect
```

### Custom Hook (`hooks/useScheduleSSE.ts`)

```typescript
// Manages SSE connection lifecycle
// Handles connection errors and reconnection
// Provides schedule data and connection status
// Cleans up on component unmount
```

## Usage

### In Components

```typescript
import { useScheduleSSE } from '@/hooks/useScheduleSSE';

const { schedule, error, isConnected } = useScheduleSSE(instructorId);
```

### Connection Status

The component displays:
- Green dot: Connected and receiving live updates
- Red dot: Connecting or disconnected
- Error messages: Connection issues

## Error Handling

- **Connection Loss**: Automatic reconnection attempts
- **Database Errors**: Graceful fallback with error messages
- **Invalid Data**: Safe parsing with error logging

## Performance Considerations

- **Change Streams**: Only active when clients are connected
- **Memory Management**: Automatic cleanup of disconnected clients
- **Database Load**: Reduced from constant polling to event-driven updates

## Migration from Polling

### Before (Polling)
```typescript
// Polling every 5 seconds
const interval = setInterval(fetchSchedule, 5000);
```

### After (SSE)
```typescript
// Real-time updates via SSE
const { schedule } = useScheduleSSE(instructorId);
```

## Testing

To test the SSE implementation:

1. Open multiple browser tabs with the Book-Now page
2. Select the same instructor in both tabs
3. Make a booking in one tab
4. Verify the other tab updates immediately without refresh

## Monitoring

The system provides:
- Connection status indicators
- Error logging for debugging
- Client count tracking per instructor 