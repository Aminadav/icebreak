const pool = require('../config/database');
require('dotenv').config({path: '../.env'});

async function cleanDatabase() {
  // Check if cleaning is allowed
  if (process.env.ALLOW_EMPTY_DATABAWSE !== 'true') {
    console.log('❌ Database cleaning is not allowed. Set ALLOW_EMPTY_DATABAWSE=true in .env to enable.');
    process.exit(1);
  }

  const client = await pool.connect();
  
  try {
    console.log('🔍 Discovering database tables...');
    
    // Get all user tables (excluding system tables and migrations table)
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
        AND tablename != 'schema_migrations'
      ORDER BY tablename;
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    
    if (tables.length === 0) {
      console.log('📋 No tables found in the database.');
      return;
    }
    
    console.log(`📋 Found ${tables.length} tables:`, tables);
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // Disable foreign key constraints temporarily
      console.log('🔓 Temporarily disabling foreign key constraints...');
      await client.query('SET session_replication_role = replica;');
      
      // Truncate all tables
      for (const table of tables) {
        console.log(`🗑️  Emptying table: ${table}`);
        await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      }
      
      // Re-enable foreign key constraints
      console.log('🔒 Re-enabling foreign key constraints...');
      await client.query('SET session_replication_role = DEFAULT;');
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ All tables have been successfully emptied!');
      console.log(`🧹 Cleaned ${tables.length} tables: ${tables.join(', ')}`);
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting database cleanup...');
  cleanDatabase()
    .then(() => {
      console.log('🎉 Database cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanDatabase;