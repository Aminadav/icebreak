const pool = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // יצירת extension עבור UUID
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ UUID extension created');
    } catch (error) {
      console.log('ℹ️ UUID extension already exists or failed to create:', error.message);
    }
    
    // בדיקה אם הטבלאות כבר קיימות
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('devices', 'games')
    `);
    
    if (tablesResult.rows.length === 2) {
      console.log('✅ Database tables already exist');
      return;
    }
    
    // יצירת טבלת devices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Devices table created');
    
    // יצירת טבלת games
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        game_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        creator_user_id UUID NOT NULL,
        status VARCHAR(50) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Games table created');
    
    // יצירת indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_games_status ON games(status)');
    console.log('✅ Indexes created');
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

// הפעלה אם זה קובץ ראשי
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database setup finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
