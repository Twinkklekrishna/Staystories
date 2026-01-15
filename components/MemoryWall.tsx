
import React, { useState, useEffect } from 'react';
import { Memory } from '../types';
import { getAllMemories, createMemory, deleteMemory } from '../services/memoriesService';

const MemoryWall: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [loading, setLoading] = useState(true);

  // Load memories on mount
  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    const data = await getAllMemories();
    // Seed with initial data if empty
    if (data.length === 0) {
      const initial = [
        { id: '1', user: 'TravelerX', text: 'The peace at the mountain chalet was unmatched.', date: '2023-10-12' },
        { id: '2', user: 'GlobalNomad', text: 'Best community vibes at the downtown hostel!', date: '2023-11-01' }
      ];
      setMemories(initial);
    } else {
      setMemories(data);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newMemory.trim()) return;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{"username":"Guest"}');
    
    const result = await createMemory({
      user: user.username,
      text: newMemory,
      date: new Date().toISOString().split('T')[0]
    });

    if (result) {
      setMemories([result, ...memories]);
      setNewMemory('');
    } else {
      alert('Failed to post memory. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    
    const success = await deleteMemory(id);
    if (success) {
      setMemories(memories.filter(m => m.id !== id));
    } else {
      alert('Failed to delete memory.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">📸</span> Memory Wall
      </h3>
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          placeholder="Share your stay memory..." 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={handlePost}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Post
        </button>
      </div>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-slate-400 text-sm italic">Loading memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No memories yet. Be the first to share!</p>
        ) : (
          memories.map(m => (
            <div key={m.id} className="border-b pb-4 last:border-0 flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-indigo-600">@{m.user}</span>
                  <span className="text-xs text-slate-400">{m.date}</span>
                </div>
                <p className="text-slate-600">{m.text}</p>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-xs text-red-500 hover:text-red-700 font-bold transition mt-1"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryWall;
