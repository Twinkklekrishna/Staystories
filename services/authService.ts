const API_URL = 'http://localhost:4000/api';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'traveler' | 'host';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/**
 * Register a new user
 */
export async function register(
  username: string,
  email: string,
  password: string,
  role: 'traveler' | 'host'
): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Registration error:', error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

/**
 * Login user
 */
export async function login(
  username: string,
  password: string
): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

/**
 * Verify token is still valid
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

/**
 * Get stored token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Save token to localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('authToken', token);
}

/**
 * Remove token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('authToken');
}

/**
 * Get auth header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}
