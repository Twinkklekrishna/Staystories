# JWT Authentication Guide

The application now has full authentication support with JWT tokens and per-user data isolation.

## What's New

### Backend Authentication

**New Modules:**
- `server/src/auth.ts` - Password hashing and JWT token management
  - `registerUser()` - Create new user account
  - `loginUser()` - Authenticate and return JWT token
  - `verifyToken()` - Validate JWT tokens
  - `hashPassword()` - Secure password hashing with bcryptjs
  - `verifyPassword()` - Compare password with hash

- `server/src/authMiddleware.ts` - Express middleware for token validation
  - `authMiddleware` - Requires valid JWT token
  - `optionalAuthMiddleware` - Allows requests with or without token

**New Auth Endpoints:**
- `POST /api/auth/register` - Create account
  - Body: `{ username, password, role: "traveler" | "host" }`
  - Returns: `{ user: { id, username, role }, token }`

- `POST /api/auth/login` - Login to existing account
  - Body: `{ username, password }`
  - Returns: `{ user: { id, username, role }, token }`

- `POST /api/auth/verify` - Check if token is still valid
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ valid: true, user: { userId, username, role } }`

**Protected Endpoints:**
All data endpoints now require JWT token:
- `POST /api/memories` - Create memory (requires auth)
- `DELETE /api/memories/:id` - Delete memory (requires auth)
- `POST /api/stays` - Create stay (requires auth)
- `PUT /api/stays/:id` - Update stay (requires auth)
- `DELETE /api/stays/:id` - Delete stay (requires auth)
- `POST /api/chat-history` - Save chat (requires auth)

Read-only endpoints are optional:
- `GET /api/memories` - View all memories (no auth required)
- `GET /api/stays` - View all stays (no auth required)
- `GET /api/chat-history/:stay_id` - View chat history (no auth required)

### Database Changes

**New Users Table:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Updated Tables with User Tracking:**
- `memories` - Added `user_id` field (foreign key to users)
- `stays` - Added `user_id` field (foreign key to users)
- `chat_history` - Added `user_id` field (foreign key to users)

### Frontend Authentication

**New Service:**
- `services/authService.ts` - Authentication client
  - `register(username, password, role)` - Register new account
  - `login(username, password)` - Login to account
  - `verifyToken(token)` - Check token validity
  - `getToken()` - Retrieve stored JWT
  - `setToken(token)` - Store JWT in localStorage
  - `clearToken()` - Remove JWT
  - `getAuthHeader()` - Returns Authorization header for API calls

**Updated Auth Page:**
- Real account creation with password validation
- Login with credentials verification
- Error messages for failed authentication
- Loading states during auth requests
- Token stored in localStorage

**Updated API Services:**
All service modules now include JWT token in requests:
- `staysService.ts` - Adds auth header to write operations
- `memoriesService.ts` - Adds auth header to write operations
- `chatService.ts` - Adds auth header to save requests

**Updated App.tsx:**
- Logout now clears both token and user data
- User restored from localStorage on app load
- Protected routes for host-only features

## Database Schema

### Users
| Field | Type | Purpose |
|-------|------|---------|
| id | TEXT | Unique user identifier |
| username | TEXT | Login username (unique) |
| password_hash | TEXT | Bcryptjs hashed password |
| role | TEXT | "traveler" or "host" |
| created_at | DATETIME | Account creation timestamp |

### Memories (Updated)
| Field | Type | Purpose |
|-------|------|---------|
| id | TEXT | Memory ID |
| user_id | TEXT | User who created memory (FK) |
| user | TEXT | Username for display |
| text | TEXT | Memory content |
| date | TEXT | Memory date |
| created_at | DATETIME | Creation timestamp |

### Stays (Updated)
| Field | Type | Purpose |
|-------|------|---------|
| id | TEXT | Stay ID |
| user_id | TEXT | Host who created stay (FK) |
| name | TEXT | Stay name |
| ... | ... | Other fields |
| created_at | DATETIME | Creation timestamp |

### Chat History (Updated)
| Field | Type | Purpose |
|-------|------|---------|
| id | TEXT | Chat message ID |
| stay_id | TEXT | Associated stay (FK) |
| user_id | TEXT | User chatting (FK) |
| user_message | TEXT | User's message |
| ai_response | TEXT | AI's response |
| created_at | DATETIME | Timestamp |

## Security Features

✅ **Password Security**
- Passwords hashed with bcryptjs (10 rounds)
- Never stored in plaintext
- Compared securely during login

✅ **Token Security**
- JWT tokens expire after 7 days
- Stored in localStorage (XSS-vulnerable, but fine for dev)
- Validated on every protected endpoint

✅ **User Isolation**
- Memories linked to user account
- Stays tracked by creator user_id
- Chat history includes user context

✅ **Endpoint Protection**
- Write operations require valid JWT
- Read operations optional (for API discoverability)
- Invalid tokens rejected with 401 Unauthorized

## Testing Auth

### Register New Account
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "secure123",
    "role": "traveler"
  }'
```

Response:
```json
{
  "user": { "id": "user-1234567890", "username": "alice", "role": "traveler" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "secure123"
  }'
```

### Protected Endpoint (with token)
```bash
curl -X POST http://localhost:4000/api/memories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "user": "alice",
    "text": "Amazing stay!",
    "date": "2026-01-15"
  }'
```

### Protected Endpoint (without token)
```bash
curl -X POST http://localhost:4000/api/memories \
  -H "Content-Type: application/json" \
  -d '{ "user": "bob", "text": "test", "date": "2026-01-15" }'
```

Response: `401 Unauthorized` - "Missing or invalid authorization header"

## Frontend Usage

### Register (Traveler)
1. Open app and click "Sign In"
2. Select "Traveler" role
3. Enter username and password
4. Click "Create Account"
5. JWT token stored automatically
6. Logged in to app

### Login
1. Enter credentials on auth page
2. Click "Enter App"
3. Token validated and user restored
4. Access dashboard

### Logout
1. Click username in navbar
2. Click "Logout"
3. Token and user data cleared
4. Redirected to auth page

## Test Cases

### New Auth Tests (6 added to api.test.ts)
✅ User registration creates account and returns token
✅ Duplicate username rejected
✅ Valid login returns token
✅ Invalid password rejected
✅ Token verification validates JWT
✅ Protected endpoints reject requests without token
✅ Protected endpoints accept requests with valid token

### Run Tests
```bash
cd server
npm run test
# Should see: 13 tests passing (API + auth)
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| JWT_SECRET | Secret key for signing tokens | "your-secret-key-change-in-production" |
| GEMINI_API_KEY | Google Gemini API key | (optional) |
| DB_PATH | Database file location | server/data/app.db |
| PORT | Server port | 4000 |

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS (tokens in Authorization header are safer than URL params)
- [ ] Store tokens in httpOnly cookies instead of localStorage
- [ ] Implement refresh token rotation
- [ ] Add rate limiting to `/api/auth/login` endpoint
- [ ] Log authentication events
- [ ] Implement account lockout after failed attempts
- [ ] Add email verification for new accounts
- [ ] Implement password reset flow
- [ ] Use argon2 instead of bcryptjs if hashing speed is critical

## Troubleshooting

**"Missing or invalid authorization header" error**
- Check token is included in request
- Verify format: `Authorization: Bearer <token>`
- Token may have expired (7 day expiry)
- Try logging in again

**"Invalid credentials" error**
- Verify username exists
- Check password spelling
- Usernames are case-sensitive

**"Username already taken" error**
- Username must be unique
- Try a different username

**Dependencies not installed**
- Run: `cd server && npm install`
- Must install: bcryptjs, jsonwebtoken

## Architecture

```
Frontend (React)
    ↓
services/authService.ts (stores token, makes API calls)
    ↓
    Authorization: Bearer <token>
    ↓
Backend API (Express)
    ↓
authMiddleware (validates JWT)
    ↓
Route Handler (creates memory, stay, chat, etc.)
    ↓
Database (isolates data by user_id)
```

Each request flow:
1. Frontend stores JWT in localStorage
2. API service includes token in Authorization header
3. Middleware validates signature and expiration
4. Route handler accesses `req.user` with decoded payload
5. Data automatically linked to user account
