# Frontend Persistence Integration Guide

The frontend has been fully integrated with the database backend. All user data is now persisted to SQLite.

## What's New

### Service Modules
Three new service modules have been created to handle API communication:

- **`services/staysService.ts`** - CRUD operations for stays
  - `getAllStays()` - Fetch all stays
  - `getStayById(stayId)` - Fetch a single stay
  - `createStay(stay)` - Create a new stay
  - `updateStay(stayId, updates)` - Update a stay
  - `deleteStay(stayId)` - Delete a stay

- **`services/memoriesService.ts`** - CRUD operations for memories
  - `getAllMemories()` - Fetch all memories
  - `createMemory(memory)` - Create a new memory
  - `deleteMemory(memoryId)` - Delete a memory

- **`services/chatService.ts`** - Chat history management
  - `getChatHistory(stayId)` - Fetch chat for a stay
  - `saveChatMessage(stayId, userMsg, aiResponse)` - Save chat exchange

### Updated Components

**App.tsx (Host Dashboard)**
- Host can now publish listings that are saved to the database
- Listings persist and can be retrieved later
- Click "Publish Listing 🚀" to save a new property

**MemoryWall.tsx**
- Memories are now fetched from the database on component load
- New memories are posted to `/api/memories` 
- Delete button (×) removes memories from database
- Shows "Loading memories..." while fetching

**AiChat.tsx**
- Chat history is now loaded from database per stay
- Each conversation with the AI is automatically saved
- Reload the page to see previous conversations restored
- First visit to a stay shows welcome message, subsequent visits show conversation history

## How to Test

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:4000`

### 2. Start the Frontend (in another terminal)
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

### 3. Test Memory Wall
1. Navigate to any stay listing
2. Scroll down to Memory Wall
3. Type a memory and click "Post"
4. The memory should appear in the list (saved to database)
5. Click × to delete a memory
6. Refresh the page - memories persist!

### 4. Test Chat History
1. On a stay details page, open the AI Chat panel
2. Ask the AI a question about the stay
3. The conversation should be saved
4. Refresh the page - your chat history is restored!

### 5. Test Publishing Listings (Host)
1. Login as a host (click Sign In, toggle to Host role)
2. Go to "Host Center"
3. Enter a stay name and click "✨ Write with Gemini" for description
4. Click "Publish Listing 🚀"
5. Check the database: `server/data/app.db` now contains your new stay

## Database Schema

### Memories Table
```sql
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  text TEXT NOT NULL,
  date TEXT NOT NULL
)
```

### Stays Table
```sql
CREATE TABLE stays (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  experience TEXT NOT NULL,
  description TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  type TEXT NOT NULL,
  priceRange TEXT,
  isAvailable BOOLEAN,
  tags TEXT -- JSON string
)
```

### Chat History Table
```sql
CREATE TABLE chat_history (
  id TEXT PRIMARY KEY,
  stay_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  FOREIGN KEY (stay_id) REFERENCES stays(id)
)
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/memories` | Fetch all memories |
| POST | `/api/memories` | Create a new memory |
| DELETE | `/api/memories/:id` | Delete a memory |
| GET | `/api/stays` | Fetch all stays |
| GET | `/api/stays/:id` | Fetch a single stay |
| POST | `/api/stays` | Create a new stay |
| PUT | `/api/stays/:id` | Update a stay |
| DELETE | `/api/stays/:id` | Delete a stay |
| GET | `/api/chat-history/:stay_id` | Get chat for a stay |
| POST | `/api/chat-history` | Save a chat message |

## Features Included

✅ **Automatic Persistence** - All user interactions saved to database
✅ **Data Recovery** - Conversations and memories restored on page refresh
✅ **Error Handling** - Graceful fallbacks if backend is unavailable
✅ **User Context** - Memories track username from localStorage
✅ **Loading States** - UX feedback while data loads
✅ **Delete Operations** - Remove memories with confirmation
✅ **Chat History** - Per-stay conversation tracking

## Troubleshooting

**Issue: "Failed to create memory" error**
- Make sure backend is running on port 4000
- Check `http://localhost:4000/api/health` - should return `{"status":"ok"}`

**Issue: Chat history not loading**
- Verify stay has an `id` prop
- Check browser console for fetch errors
- Backend must have write permissions to `server/data/app.db`

**Issue: CORS errors**
- Backend should have CORS enabled (default)
- Verify frontend is on `localhost:5173` and backend on `localhost:4000`

## Next Steps (Optional)

- Add authentication to track memories per user
- Implement stay filtering/search
- Add image upload for memories
- Create user profile to view own stays/memories
- Add sync indicator (visual feedback when saving)
