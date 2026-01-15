import { Memory } from '../types';
import { getAuthHeader } from './authService';

const API_URL = 'http://localhost:4000/api';

/**
 * Fetch all memories
 */
export async function getAllMemories(): Promise<Memory[]> {
  try {
    const response = await fetch(`${API_URL}/memories`);
    if (!response.ok) throw new Error('Failed to fetch memories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
}

/**
 * Create a new memory
 */
export async function createMemory(memory: Omit<Memory, 'id'>): Promise<Memory | null> {
  try {
    const response = await fetch(`${API_URL}/memories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(memory)
    });
    if (!response.ok) throw new Error('Failed to create memory');
    return await response.json();
  } catch (error) {
    console.error('Error creating memory:', error);
    return null;
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/memories/${memoryId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting memory:', error);
    return false;
  }
}
