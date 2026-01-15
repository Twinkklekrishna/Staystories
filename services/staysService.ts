import { Stay } from '../types';
import { getAuthHeader } from './authService';

const API_URL = 'http://localhost:4000/api';

/**
 * Fetch all stays from the backend
 */
export async function getAllStays(): Promise<Stay[]> {
  try {
    const response = await fetch(`${API_URL}/stays`);
    if (!response.ok) throw new Error('Failed to fetch stays');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stays:', error);
    return [];
  }
}

/**
 * Fetch a single stay by ID
 */
export async function getStayById(stayId: string): Promise<Stay | null> {
  try {
    const response = await fetch(`${API_URL}/stays/${stayId}`);
    if (!response.ok) throw new Error('Failed to fetch stay');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stay:', error);
    return null;
  }
}

/**
 * Create a new stay
 */
export async function createStay(stay: Omit<Stay, 'id'>): Promise<Stay | null> {
  try {
    const response = await fetch(`${API_URL}/stays`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(stay)
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to create stay:', response.status, errorData);
      throw new Error(`Failed to create stay: ${errorData}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating stay:', error);
    return null;
  }
}

/**
 * Update an existing stay
 */
export async function updateStay(stayId: string, updates: Partial<Stay>): Promise<Stay | null> {
  try {
    const response = await fetch(`${API_URL}/stays/${stayId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update stay');
    return await response.json();
  } catch (error) {
    console.error('Error updating stay:', error);
    return null;
  }
}

/**
 * Delete a stay
 */
export async function deleteStay(stayId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/stays/${stayId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting stay:', error);
    return false;
  }
}
