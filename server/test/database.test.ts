import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { memory, stay, chatHistory, initializeDatabase, resetDatabase } from '../src/database';
import fs from 'fs';
import path from 'path';

// Use a test database
const testDbPath = path.join(__dirname, 'test.db');

describe('Database Operations', () => {
  beforeEach(() => {
    // Clean up test database before each test
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Override DB_PATH for tests
    process.env.DB_PATH = testDbPath;
    // Reset and re-initialize with test DB
    resetDatabase();
    initializeDatabase();
  });

  afterEach(() => {
    // Clean up
    resetDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Memory CRUD', () => {
    it('should create a memory', () => {
      const mem = memory.create({
        id: 'mem-1',
        user: 'alice',
        text: 'Great place!',
        date: '2026-01-15'
      });
      expect(mem.id).toBe('mem-1');
      expect(mem.user).toBe('alice');
    });

    it('should retrieve all memories', () => {
      memory.create({ id: 'mem-1', user: 'alice', text: 'Note 1', date: '2026-01-15' });
      memory.create({ id: 'mem-2', user: 'bob', text: 'Note 2', date: '2026-01-14' });
      
      const all = memory.getAll();
      expect(all.length).toBe(2);
    });

    it('should filter memories by user', () => {
      memory.create({ id: 'mem-1', user: 'alice', text: 'Note 1', date: '2026-01-15' });
      memory.create({ id: 'mem-2', user: 'bob', text: 'Note 2', date: '2026-01-14' });
      
      const alice = memory.getAll('alice');
      expect(alice.length).toBe(1);
      expect(alice[0].user).toBe('alice');
    });

    it('should delete a memory', () => {
      memory.create({ id: 'mem-1', user: 'alice', text: 'Note 1', date: '2026-01-15' });
      memory.delete('mem-1');
      
      const all = memory.getAll();
      expect(all.length).toBe(0);
    });
  });

  describe('Stay CRUD', () => {
    it('should create a stay', () => {
      const s = stay.create({
        id: 'stay-1',
        name: 'Lake House',
        type: 'cabin',
        lat: 45.5,
        lon: -120.5,
        description: 'Cozy place',
        priceRange: '$$',
        experience: 'Silent',
        amenities: ['wifi', 'kitchen'],
        tags: { type: 'nature' },
        isAvailable: true
      });
      expect(s.name).toBe('Lake House');
    });

    it('should retrieve all stays', () => {
      stay.create({
        id: 'stay-1',
        name: 'Lake House',
        amenities: [],
        tags: {},
        isAvailable: true
      });
      stay.create({
        id: 'stay-2',
        name: 'Mountain Cabin',
        amenities: [],
        tags: {},
        isAvailable: true
      });
      
      const all = stay.getAll();
      expect(all.length).toBe(2);
    });

    it('should retrieve a stay by ID', () => {
      stay.create({
        id: 'stay-1',
        name: 'Lake House',
        amenities: ['wifi'],
        tags: { type: 'nature' },
        isAvailable: true
      });
      
      const s = stay.getById('stay-1');
      expect(s).not.toBeNull();
      expect(s?.name).toBe('Lake House');
      expect(s?.amenities).toEqual(['wifi']);
    });

    it('should update a stay', () => {
      stay.create({
        id: 'stay-1',
        name: 'Lake House',
        description: 'Old desc',
        amenities: [],
        tags: {},
        isAvailable: true
      });
      
      stay.update('stay-1', { description: 'New desc' });
      const s = stay.getById('stay-1');
      expect(s?.description).toBe('New desc');
    });

    it('should delete a stay', () => {
      stay.create({
        id: 'stay-1',
        name: 'Lake House',
        amenities: [],
        tags: {},
        isAvailable: true
      });
      
      stay.delete('stay-1');
      const all = stay.getAll();
      expect(all.length).toBe(0);
    });
  });

  describe('Chat History CRUD', () => {
    it('should create a chat history entry', () => {
      const entry = chatHistory.create({
        id: 'chat-1',
        stay_id: 'stay-1',
        user_message: 'Is wifi available?',
        ai_response: 'Yes, wifi is available.'
      });
      expect(entry.id).toBe('chat-1');
    });

    it('should retrieve chat history by stay', () => {
      chatHistory.create({
        id: 'chat-1',
        stay_id: 'stay-1',
        user_message: 'Hi',
        ai_response: 'Hello'
      });
      chatHistory.create({
        id: 'chat-2',
        stay_id: 'stay-1',
        user_message: 'How?',
        ai_response: 'Good'
      });
      
      const history = chatHistory.getByStay('stay-1');
      expect(history.length).toBe(2);
    });

    it('should retrieve all chat history', () => {
      chatHistory.create({
        id: 'chat-1',
        stay_id: 'stay-1',
        user_message: 'Hi',
        ai_response: 'Hello'
      });
      chatHistory.create({
        id: 'chat-2',
        stay_id: 'stay-2',
        user_message: 'Hello',
        ai_response: 'Hi there'
      });
      
      const all = chatHistory.getAll();
      expect(all.length).toBe(2);
    });
  });
});
