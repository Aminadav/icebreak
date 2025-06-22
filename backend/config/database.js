const { Pool } = require('pg');
require('dotenv').config({path: __dirname + '/../.env'});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// בדיקת חיבור למסד הנתונים
pool.on('connect', () => {
  // console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;
