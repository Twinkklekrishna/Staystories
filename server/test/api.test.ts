import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock the Google GenAI client so tests don't hit the real API
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor(_opts: any) {}
    models = {
      generateContent: async (opts: any) => {
        const contents = opts?.contents;
        if (typeof contents === 'string' && contents.startsWith('Write a compelling')) {
          return { text: 'Mock description' };
        }
        return { text: 'Mock chat response' };
      }
    };
  }
}));

const setupApp = async (overrides: { RATE_LIMIT_WINDOW_MS?: number; RATE_LIMIT_MAX?: number } = {}) => {
  // Set env before importing so limiter config picks it up
  if (overrides.RATE_LIMIT_WINDOW_MS !== undefined) process.env.RATE_LIMIT_WINDOW_MS = String(overrides.RATE_LIMIT_WINDOW_MS);
  if (overrides.RATE_LIMIT_MAX !== undefined) process.env.RATE_LIMIT_MAX = String(overrides.RATE_LIMIT_MAX);
  // Ensure AI key is present for tests so aiClient is created (we mock the client implementation)
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

  // Dynamic import with a changing query param to avoid cached module during tests
  const mod = await import(`../src/index?update=${Date.now()}`);
  return mod.default;
};

describe('Server API', () => {
  it('GET /api/health returns ok', async () => {
    const app = await setupApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/ai/chat returns 400 for invalid payload', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/ai/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/ai/description returns 400 for missing fields', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/ai/description').send({ stayName: '' });
    expect(res.status).toBe(400);
  });

  it('POST /api/ai/chat returns 200 and text when AI responds', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/ai/chat').send({ message: 'Tell me about this place', stay: { name: 'Test' } });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Mock chat response');
  });

  it('POST /api/ai/description returns 200 and text when AI responds', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/ai/description').send({ stayName: 'Lake House', experience: 'Silent' });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Mock description');
  });

  it('rate limiter blocks after max exceeded', async () => {
    const app = await setupApp({ RATE_LIMIT_WINDOW_MS: 1000, RATE_LIMIT_MAX: 2 });

    const r1 = await request(app).post('/api/ai/chat').send({ message: 'hi' });
    const r2 = await request(app).post('/api/ai/chat').send({ message: 'hi' });
    const r3 = await request(app).post('/api/ai/chat').send({ message: 'hi' });

    // One of the requests should be 429 when limit=2
    expect([r1.status, r2.status, r3.status].some(s => s === 429)).toBe(true);
  });

  // Auth tests
  it('POST /api/auth/register creates user and returns token', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      password: 'password123',
      role: 'traveler'
    });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.role).toBe('traveler');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/register rejects duplicate username', async () => {
    const app = await setupApp();
    await request(app).post('/api/auth/register').send({
      username: 'dupuser',
      password: 'password123',
      role: 'traveler'
    });
    const res = await request(app).post('/api/auth/register').send({
      username: 'dupuser',
      password: 'different',
      role: 'host'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    const app = await setupApp();
    await request(app).post('/api/auth/register').send({
      username: 'loginuser',
      password: 'secret123',
      role: 'traveler'
    });
    const res = await request(app).post('/api/auth/login').send({
      username: 'loginuser',
      password: 'secret123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('loginuser');
  });

  it('POST /api/auth/login rejects invalid password', async () => {
    const app = await setupApp();
    await request(app).post('/api/auth/register').send({
      username: 'wrongpass',
      password: 'correct123',
      role: 'traveler'
    });
    const res = await request(app).post('/api/auth/login').send({
      username: 'wrongpass',
      password: 'wrong123'
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/verify validates token', async () => {
    const app = await setupApp();
    const regRes = await request(app).post('/api/auth/register').send({
      username: 'verifyuser',
      password: 'verify123',
      role: 'host'
    });
    const token = regRes.body.token;

    const res = await request(app).post('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.user.username).toBe('verifyuser');
  });

  it('Protected endpoints reject requests without token', async () => {
    const app = await setupApp();
    const res = await request(app).post('/api/memories').send({
      user: 'test',
      text: 'memory',
      date: '2026-01-15'
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('Protected endpoints accept requests with valid token', async () => {
    const app = await setupApp();
    const regRes = await request(app).post('/api/auth/register').send({
      username: 'memuser',
      password: 'mem123',
      role: 'traveler'
    });
    const token = regRes.body.token;

    const res = await request(app).post('/api/memories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: 'memuser',
        text: 'great stay',
        date: '2026-01-15'
      });
    expect(res.status).toBe(201);
    expect(res.body.text).toBe('great stay');
  });
});