const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname, '../migrations');
  }

  async initializeMigrationsTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Schema migrations table initialized');
    } catch (error) {
      console.error('❌ Error initializing migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
      return result.rows.map(row => row.version);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      throw error;
    }
  }

  async getPendingMigrations() {
    try {
      const files = await fs.readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      const executedMigrations = await this.getExecutedMigrations();
      
      return migrationFiles.filter(file => {
        const version = file.replace('.sql', '');
        return !executedMigrations.includes(version);
      });
    } catch (error) {
      console.error('❌ Error getting pending migrations:', error);
      throw error;
    }
  }

  async executeMigration(migrationFile) {
    try {
      const migrationPath = path.join(this.migrationsDir, migrationFile);
      const sql = await fs.readFile(migrationPath, 'utf8');
      const version = migrationFile.replace('.sql', '');

      console.log(`🔄 Executing migration: ${version}`);
      
      await pool.query('BEGIN');
      
      // Execute the migration SQL
      var res=await pool.query(sql);
      console.log(`Executed ${res.rowCount} statements in migration ${version}`);
      if (res.rowCount === 0) {
        console.warn(`⚠️  No changes made by migration ${version}`);
      }
      // show output (the res) output of the migration
      console.log(res);
      
      // Record the migration as executed
      await pool.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [version]
      );
      
      await pool.query('COMMIT');
      console.log(`✅ Migration ${version} executed successfully`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`❌ Error executing migration ${migrationFile}:`, error);
      throw error;
    }
  }

  async runPendingMigrations() {
    try {
      await this.initializeMigrationsTable();
      
      const pendingMigrations = await this.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`🔄 Found ${pendingMigrations.length} pending migrations`);
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('✅ All migrations executed successfully');
    } catch (error) {
      console.error('❌ Error running migrations:', error);
      throw error;
    }
  }

  async createMigration(name) {
    try {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const files = await fs.readdir(this.migrationsDir);
      const existingMigrations = files
        .filter(file => file.endsWith('.sql'))
        .map(file => parseInt(file.split('_')[0]))
        .filter(num => !isNaN(num));
      
      const nextNumber = existingMigrations.length > 0 ? Math.max(...existingMigrations) + 1 : 1;
      const paddedNumber = nextNumber.toString().padStart(3, '0');
      const filename = `${paddedNumber}_${name}.sql`;
      const filepath = path.join(this.migrationsDir, filename);
      
      const template = `-- Migration: ${paddedNumber}_${name}
-- Description: ${name.replace(/_/g, ' ')}
-- Date: ${new Date().toISOString().slice(0, 10)}

-- Add your migration SQL here
-- Example:
-- ALTER TABLE games ADD COLUMN description TEXT;
-- CREATE INDEX IF NOT EXISTS idx_games_description ON games(description);
`;
      
      await fs.writeFile(filepath, template);
      console.log(`✅ Created migration file: ${filename}`);
      return filename;
    } catch (error) {
      console.error('❌ Error creating migration:', error);
      throw error;
    }
  }

  async rollbackMigration(version) {
    try {
      console.log(`🔄 Rolling back migration: ${version}`);
      
      await pool.query('BEGIN');
      
      // Remove from migrations table
      await pool.query(
        'DELETE FROM schema_migrations WHERE version = $1',
        [version]
      );
      
      await pool.query('COMMIT');
      console.log(`✅ Migration ${version} rolled back (removed from tracking)`);
      console.log('⚠️  Note: You need to manually reverse the schema changes if needed');
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`❌ Error rolling back migration ${version}:`, error);
      throw error;
    }
  }

  async getMigrationStatus() {
    try {
      await this.initializeMigrationsTable();
      
      const files = await fs.readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      const executedMigrations = await this.getExecutedMigrations();
      
      console.log('\n📋 Migration Status:');
      console.log('===================');
      
      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');
        const status = executedMigrations.includes(version) ? '✅ Executed' : '⏳ Pending';
        console.log(`${status} - ${version}`);
      }
      
      const pendingCount = migrationFiles.length - executedMigrations.length;
      console.log(`\n📊 Total: ${migrationFiles.length} migrations, ${pendingCount} pending`);
    } catch (error) {
      console.error('❌ Error getting migration status:', error);
      throw error;
    }
  }
}

module.exports = MigrationManager;
