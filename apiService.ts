// API service for communicating with backend

// Dynamically construct API URL based on current host
const getAPIUrl = () => {
  // On Vercel (production), use relative path to /api
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return '/api';
  }
  
  // On localhost development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://${window.location.hostname}:5000/api`;
  }
  
  // On specific network IP (like 155.155.0.121)
  if (window.location.hostname === '155.155.0.121') {
    return `http://${window.location.hostname}:5000/api`;
  }
  
  // Fallback to relative /api
  return '/api';
};

const API_URL = getAPIUrl();

export const apiService = {
  // Attendance endpoints
  getAttendance: async () => {
    try {
      const response = await fetch(`${API_URL}/attendance`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  saveAttendance: async (record) => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!response.ok) throw new Error('Failed to save attendance');
      return await response.json();
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  },

  updateAttendance: async (record) => {
    try {
      const response = await fetch(`${API_URL}/attendance/${record.date}_${record.subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!response.ok) throw new Error('Failed to update attendance');
      return await response.json();
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  clearAttendance: async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/clear`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to clear attendance');
      return await response.json();
    } catch (error) {
      console.error('Error clearing attendance:', error);
      throw error;
    }
  },

  // Locks endpoints
  getLocks: async () => {
    try {
      const response = await fetch(`${API_URL}/locks`);
      if (!response.ok) throw new Error('Failed to fetch locks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching locks:', error);
      return {};
    }
  },

  toggleLock: async (key) => {
    try {
      const response = await fetch(`${API_URL}/locks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      if (!response.ok) throw new Error('Failed to toggle lock');
      return await response.json();
    } catch (error) {
      console.error('Error toggling lock:', error);
      throw error;
    }
  },

  clearLocks: async () => {
    try {
      const response = await fetch(`${API_URL}/locks/clear`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to clear locks');
      return await response.json();
    } catch (error) {
      console.error('Error clearing locks:', error);
      throw error;
    }
  }
};
