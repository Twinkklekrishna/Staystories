import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import { initializeDatabase, memory, stay, chatHistory } from './database';
import { registerUser, loginUser, generateToken } from './auth';
import { authMiddleware, optionalAuthMiddleware } from './authMiddleware';

// Lazy load swagger UI only if available
let swaggerUi: any = null;
try {
  swaggerUi = require('swagger-ui-express');
} catch (err) {
  // swagger-ui-express not installed, skip
}
// Simple inline validators (replaces zod to avoid dependency issues in some environments)
const validateChat = (body: any) => {
  const errors: any[] = [];
  if (!body || typeof body.message !== 'string' || body.message.trim().length === 0) {
    errors.push({ path: ['message'], message: 'message is required and must be a non-empty string' });
  }
  if (body?.stay) {
    const s = body.stay;
    if (s.amenities && !Array.isArray(s.amenities)) {
      errors.push({ path: ['stay','amenities'], message: 'amenities must be an array of strings' });
    }
    // basic type checks
    if (s.name && typeof s.name !== 'string') errors.push({ path: ['stay','name'], message: 'name must be a string' });
  }
  return { success: errors.length === 0, errors, data: { stay: body?.stay, message: body?.message } };
};

const validateDescription = (body: any) => {
  const errors: any[] = [];
  if (!body || typeof body.stayName !== 'string' || body.stayName.trim().length === 0) {
    errors.push({ path: ['stayName'], message: 'stayName is required and must be a non-empty string' });
  }
  if (!body || typeof body.experience !== 'string' || body.experience.trim().length === 0) {
    errors.push({ path: ['experience'], message: 'experience is required and must be a non-empty string' });
  }
  return { success: errors.length === 0, errors, data: { stayName: body?.stayName, experience: body?.experience } };
};

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
initializeDatabase();

// Request logging (morgan) — optional at runtime
let morgan: any;
try {
  morgan = require('morgan');
} catch (err) {
  morgan = null;
}
if (morgan) app.use(morgan('combined'));

// Rate limiting for AI endpoints (express-rate-limit)
let createRateLimit: any;
try {
  createRateLimit = require('express-rate-limit');
} catch (err) {
  createRateLimit = null;
}
const rateWindow = process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 60 * 1000;
const rateMax = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 30;
const aiLimiter = createRateLimit ? createRateLimit({
  windowMs: rateWindow,
  max: rateMax,
  standardHeaders: true,
  legacyHeaders: false,
}) : (_req: any, _res: any, next: any) => next();

app.use('/api/ai/', aiLimiter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const useMockAi = process.env.USE_MOCK_AI === 'true' || process.env.NODE_ENV === 'development';

if (!apiKey && !useMockAi) {
  console.warn('GEMINI_API_KEY is not set. The AI endpoints will return an error until it is configured.');
}

let aiClient: any = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
} else if (useMockAi) {
  console.info('USE_MOCK_AI enabled — serving canned AI responses in development.');
  aiClient = {
    models: {
      generateContent: async ({ contents }: any) => {
        // Simple heuristics to return context-appropriate canned responses
        if (typeof contents === 'string' && contents.startsWith('Write a compelling')) {
          return { text: `Mock description: Beautiful spot offering a unique experience — perfect for curious travelers.` };
        }
        // For chat-like inputs, echo back friendly guidance
        const msg = typeof contents === 'string' ? contents : 'Hello from mock AI';
        return { text: `Mock reply: ${msg}` };
      }
    }
  };
}

// Health endpoint
app.get('/api/health', (req: any, res: any) => {
  return res.json({ status: 'ok', uptime: process.uptime(), version: process.env.npm_package_version || '1.0.0' });
});

// Auth endpoints
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'username, email, password, and role required' });
    }
    if (!['traveler', 'host'].includes(role)) {
      return res.status(400).json({ error: 'role must be traveler or host' });
    }
    
    const result = await registerUser(username, email, password, role);
    if ('error' in result) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }
    
    const result = await loginUser(username, password);
    if ('error' in result) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint (optional, for checking if token is still valid)
app.post('/api/auth/verify', authMiddleware, (req: any, res: any) => {
  res.json({ valid: true, user: req.user });
});

// OpenAPI/Swagger documentation
const openApiSpec: any = {
  openapi: '3.0.0',
  info: { title: 'Stay Backend API', version: '1.0.0', description: 'Backend API for Stay Stories app' },
  servers: [{ url: '/', description: 'Current server' }],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { 200: { description: 'Server is healthy' } }
      }
    },
    '/api/ai/chat': {
      post: {
        tags: ['AI'],
        summary: 'Chat with stay assistant',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, stay: { type: 'object', properties: { name: { type: 'string' }, experience: { type: 'string' } } } }, required: ['message'] } } } },
        responses: { 200: { description: 'AI response' }, 400: { description: 'Invalid payload' } }
      }
    },
    '/api/ai/description': {
      post: {
        tags: ['AI'],
        summary: 'Generate listing description',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stayName: { type: 'string' }, experience: { type: 'string' } }, required: ['stayName', 'experience'] } } } },
        responses: { 200: { description: 'Generated description' }, 400: { description: 'Invalid payload' } }
      }
    }
  }
};

if (swaggerUi) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

// Memory endpoints (requires auth)
app.get('/api/memories', optionalAuthMiddleware, (req: any, res: any) => {
  const user = req.query.user as string | undefined;
  const memories = memory.getAll(user);
  return res.json(memories);
});

app.post('/api/memories', authMiddleware, (req: any, res: any) => {
  const { user, text, date } = req.body;
  if (!user || !text || !date) {
    return res.status(400).json({ error: 'Missing required fields: user, text, date' });
  }
  const id = `mem-${Date.now()}`;
  const result = memory.create({ id, user, text, date });
  return res.status(201).json(result);
});

app.delete('/api/memories/:id', authMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  memory.delete(id);
  return res.json({ success: true });
});

// Stay endpoints (requires auth for create/update/delete)
app.get('/api/stays', optionalAuthMiddleware, (req: any, res: any) => {
  const stays = stay.getAll();
  return res.json(stays);
});

app.post('/api/stays', authMiddleware, (req: any, res: any) => {
  const data = req.body;
  if (!data.name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }
  const id = `stay-${Date.now()}`;
  const result = stay.create({ id, user_id: req.user?.userId, ...data });
  return res.status(201).json(result);
});

app.get('/api/stays/:id', optionalAuthMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  const stayData = stay.getById(id);
  if (!stayData) {
    return res.status(404).json({ error: 'Stay not found' });
  }
  return res.json(stayData);
});

app.put('/api/stays/:id', authMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  stay.update(id, req.body);
  return res.json({ success: true });
});

app.delete('/api/stays/:id', authMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  stay.delete(id);
  return res.json({ success: true });
});

// Chat history endpoints (requires auth)
app.get('/api/chat-history/:stay_id', optionalAuthMiddleware, (req: any, res: any) => {
  const { stay_id } = req.params;
  const history = chatHistory.getByStay(stay_id);
  return res.json(history);
});

app.post('/api/chat-history', authMiddleware, (req: any, res: any) => {
  const { stay_id, user_message, ai_response } = req.body;
  if (!stay_id || !user_message || !ai_response) {
    return res.status(400).json({ error: 'Missing required fields: stay_id, user_message, ai_response' });
  }
  const id = `chat-${Date.now()}`;
  const result = chatHistory.create({ id, stay_id, user_id: req.user?.userId, user_message, ai_response });
  return res.status(201).json(result);
});


app.post('/api/ai/chat', async (req: any, res: any) => {
  try {
    const parse = validateChat(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload', details: parse.errors });
    const { stay, message } = parse.data;


    const systemInstruction = `
      You are the "Stay Story Assistant" for a property called "${stay?.name || 'unknown'}".
      This property is categorized as a "${stay?.experience || 'general'}" experience.

      Your Role:
      - You are an AI travel assistant, NOT the property owner or host.
      - Answer questions about the stay's vibe, local area, and travel tips.
      - Do NOT make firm promises about availability, exact check-in times, or pricing.
      - If asked about booking or rules, suggest talking to the host directly once booked.
      - Stay Details: ${stay?.description || ''}
      - Amenities (if any): ${(stay?.amenities || []).join(', ')}
      - Style: Friendly, professional, and adventurous.
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error) {
    console.error('AI chat error', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/api/ai/description', async (req: any, res: any) => {
  try {
    const parse = validateDescription(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload', details: parse.errors });
    const { stayName, experience } = parse.data;

    const prompt = `Write a compelling 3-sentence description for a new travel listing named "${stayName}" which offers a "${experience}" experience. Highlight why travelers would love it.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return res.json({ text: response.text || '' });
  } catch (error) {
    console.error('AI description error', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Stay backend running on http://localhost:${PORT}`);
  });
}

export default app;
