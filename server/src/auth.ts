import { getDb } from './database';

let bcryptjs: any;
let jwt: any;

try {
  bcryptjs = require('bcryptjs');
} catch (err) {
  bcryptjs = null;
}

try {
  jwt = require('jsonwebtoken');
} catch (err) {
  jwt = null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'traveler' | 'host';
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: 'traveler' | 'host';
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!bcryptjs) throw new Error('bcryptjs not available');
  return bcryptjs.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!bcryptjs) throw new Error('bcryptjs not available');
  return bcryptjs.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(user: TokenPayload): string {
  if (!jwt) throw new Error('jsonwebtoken not available');
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!jwt) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: 'traveler' | 'host'
): Promise<{ user: AuthUser; token: string } | { error: string }> {
  try {
    const db = getDb();
    
    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return { error: 'Username already taken' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = `user-${Date.now()}`;

    // Create user
    db.prepare(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, username, email, passwordHash, role);

    const user: AuthUser = { id: userId, username, email, role };
    const token = generateToken({ userId, username, role });

    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Registration failed' };
  }
}

/**
 * Login user
 */
export async function loginUser(
  username: string,
  password: string
): Promise<{ user: AuthUser; token: string } | { error: string }> {
  try {
    const db = getDb();

    // Find user
    const row = db.prepare('SELECT id, username, email, password_hash, role FROM users WHERE username = ?').get(username) as any;
    if (!row) {
      return { error: 'Invalid credentials' };
    }

    // Verify password
    const isValid = await verifyPassword(password, row.password_hash);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    const user: AuthUser = { id: row.id, username: row.username, email: row.email || 'unknown@email.com', role: row.role };
    const token = generateToken({ userId: row.id, username: row.username, role: row.role });

    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): AuthUser | null {
  try {
    const db = getDb();
    const row = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(userId) as any;
    if (!row) return null;
    return { id: row.id, username: row.username, email: row.email || 'unknown@email.com', role: row.role };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
