import path from 'path';

// In-memory database using Maps for development
class InMemoryDB {
  private users = new Map<string, any>();
  private memories = new Map<string, any>();
  private stays = new Map<string, any>();
  private chatHistory = new Map<string, any>();

  prepare(sql: string) {
    return {
      run: (...args: any[]) => this.handleRun(sql, args),
      get: (...args: any[]) => this.handleGet(sql, args),
      all: (...args: any[]) => this.handleAll(sql, args),
    };
  }

  exec(sql: string) {
    // Schema initialization - no-op for in-memory DB
    return;
  }

  pragma(pragma: string) {
    // Pragma calls are no-op for in-memory DB
    return;
  }

  close() {
    // No-op for in-memory DB
  }

  private handleRun(sql: string, args: any[]) {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('insert into users')) {
      const [id, username, email, passwordHash, role] = args;
      this.users.set(id, { id, username, email, password_hash: passwordHash, role, created_at: new Date().toISOString() });
      return { lastID: id, changes: 1 };
    }
    
    if (lowerSql.includes('insert into memories')) {
      const [id, user, text, date] = args;
      this.memories.set(id, { id, user, text, date, created_at: new Date().toISOString(), user_id: null });
      return { lastID: id, changes: 1 };
    }
    
    if (lowerSql.includes('insert into stays')) {
      const [id, name, type, lat, lon, desc, priceRange, experience, amenities, tags, photoUrl, isAvailable] = args;
      this.stays.set(id, { id, name, type, lat: parseFloat(lat), lon: parseFloat(lon), description: desc, priceRange, experience, amenities, tags, photoUrl, isAvailable, created_at: new Date().toISOString(), user_id: null });
      return { lastID: id, changes: 1 };
    }
    
    if (lowerSql.includes('insert into chat_history')) {
      const [id, stayId, userId, userMsg, aiResp] = args;
      this.chatHistory.set(id, { id, stay_id: stayId, user_id: userId, user_message: userMsg, ai_response: aiResp, created_at: new Date().toISOString() });
      return { lastID: id, changes: 1 };
    }
    
    if (lowerSql.includes('update stays')) {
      const [name, description, priceRange, experience, amenities, isAvailable, id] = args;
      if (this.stays.has(id)) {
        const stay = this.stays.get(id);
        stay.name = name;
        stay.description = description;
        stay.priceRange = priceRange;
        stay.experience = experience;
        stay.amenities = amenities;
        stay.isAvailable = isAvailable;
      }
      return { changes: 1 };
    }
    
    if (lowerSql.includes('delete from memories')) {
      const [id] = args;
      this.memories.delete(id);
      return { changes: 1 };
    }
    
    if (lowerSql.includes('delete from stays')) {
      const [id] = args;
      this.stays.delete(id);
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  private handleGet(sql: string, args: any[]) {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('select') && lowerSql.includes('from users where id')) {
      return this.users.get(args[0]);
    }
    
    if (lowerSql.includes('select') && lowerSql.includes('from users where username')) {
      const [username] = args;
      for (const user of this.users.values()) {
        if (user.username === username) return user;
      }
      return undefined;
    }
    
    if (lowerSql.includes('select') && lowerSql.includes('from stays where id')) {
      return this.stays.get(args[0]);
    }

    return undefined;
  }

  private handleAll(sql: string, args: any[]) {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('select * from memories where user')) {
      const [user] = args;
      return Array.from(this.memories.values()).filter(m => m.user === user).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    
    if (lowerSql.includes('select * from memories order by date')) {
      return Array.from(this.memories.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    
    if (lowerSql.includes('select * from stays order by created_at')) {
      return Array.from(this.stays.values()).map(stay => ({
        ...stay,
        amenities: typeof stay.amenities === 'string' ? JSON.parse(stay.amenities) : stay.amenities,
        tags: typeof stay.tags === 'string' ? JSON.parse(stay.tags) : stay.tags,
        isAvailable: stay.isAvailable === 1 ? true : stay.isAvailable === 0 ? false : stay.isAvailable
      }));
    }
    
    if (lowerSql.includes('select * from chat_history where stay_id')) {
      const [stayId] = args;
      return Array.from(this.chatHistory.values()).filter(c => c.stay_id === stayId);
    }
    
    if (lowerSql.includes('select * from chat_history order by created_at')) {
      return Array.from(this.chatHistory.values());
    }

    if (lowerSql.includes('select * from users')) {
      return Array.from(this.users.values());
    }

    return [];
  }
}

let dbInstance: InMemoryDB | null = null;

export function getDb(): any {
  if (!dbInstance) {
    dbInstance = new InMemoryDB();
    console.log('✓ In-memory database initialized');
  }
  return dbInstance;
}

export function resetDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

const db = getDb();

// Initialize schema
export const initializeDatabase = () => {
  const db = getDb();
  
  // Users table (for authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Memories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user TEXT NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Stays table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stays (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      type TEXT,
      lat REAL,
      lon REAL,
      description TEXT,
      priceRange TEXT,
      experience TEXT,
      amenities TEXT,
      tags TEXT,
      photoUrl TEXT,
      isAvailable INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Chat history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id TEXT PRIMARY KEY,
      stay_id TEXT NOT NULL,
      user_id TEXT,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stay_id) REFERENCES stays(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

// Memory CRUD operations
export const memory = {
  create: (data: { id: string; user: string; text: string; date: string }) => {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO memories (id, user, text, date) VALUES (?, ?, ?, ?)'
    );
    stmt.run(data.id, data.user, data.text, data.date);
    return data;
  },
  getAll: (user?: string) => {
    const db = getDb();
    if (user) {
      const stmt = db.prepare('SELECT * FROM memories WHERE user = ? ORDER BY date DESC');
      return stmt.all(user) as any[];
    }
    const stmt = db.prepare('SELECT * FROM memories ORDER BY date DESC');
    return stmt.all() as any[];
  },
  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM memories WHERE id = ?');
    stmt.run(id);
  }
};

// Stay CRUD operations
export const stay = {
  create: (data: any) => {
    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO stays (id, name, type, lat, lon, description, priceRange, experience, amenities, tags, photoUrl, isAvailable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      data.id,
      data.name,
      data.type,
      data.lat,
      data.lon,
      data.description,
      data.priceRange,
      data.experience,
      JSON.stringify(data.amenities || []),
      JSON.stringify(data.tags || {}),
      data.photoUrl || null,
      data.isAvailable ? 1 : 0
    );
    return data;
  },
  getAll: () => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM stays ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      amenities: JSON.parse(row.amenities || '[]'),
      tags: JSON.parse(row.tags || '{}'),
      isAvailable: row.isAvailable === 1
    }));
  },
  getById: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM stays WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      ...row,
      amenities: JSON.parse(row.amenities || '[]'),
      tags: JSON.parse(row.tags || '{}'),
      isAvailable: row.isAvailable === 1
    };
  },
  update: (id: string, data: Partial<any>) => {
    const db = getDb();
    const stmt = db.prepare(
      `UPDATE stays SET name = ?, description = ?, priceRange = ?, experience = ?, amenities = ?, isAvailable = ? WHERE id = ?`
    );
    stmt.run(
      data.name,
      data.description,
      data.priceRange,
      data.experience,
      JSON.stringify(data.amenities || []),
      data.isAvailable ? 1 : 0,
      id
    );
  },
  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM stays WHERE id = ?');
    stmt.run(id);
  }
};

// Chat history CRUD operations
export const chatHistory = {
  create: (data: { id: string; stay_id: string; user_id?: string; user_message: string; ai_response: string }) => {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO chat_history (id, stay_id, user_id, user_message, ai_response) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(data.id, data.stay_id, data.user_id || null, data.user_message, data.ai_response);
    return data;
  },
  getByStay: (stay_id: string) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM chat_history WHERE stay_id = ? ORDER BY created_at ASC');
    return stmt.all(stay_id) as any[];
  },
  getAll: () => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM chat_history ORDER BY created_at DESC');
    return stmt.all() as any[];
  }
};

export default db;
