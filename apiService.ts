// API service for communicating with backend

// Dynamically construct API URL based on current host
const getAPIUrl = () => {
  // If running on development server with specific network IP
  if (window.location.hostname === '155.155.0.121' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Replace the port with 5000 (backend port)
    return `http://${window.location.hostname}:5000/api`;
  }
  // Default fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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
