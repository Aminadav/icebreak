#!/usr/bin/env node
const MigrationManager = require('./MigrationManager');

async function main() {
  const migrationManager = new MigrationManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'run':
        await migrationManager.runPendingMigrations();
        break;
      
      case 'create':
        if (!arg) {
          console.error('❌ Please provide a migration name: pnpm migrate create add_user_table');
          process.exit(1);
        }
        await migrationManager.createMigration(arg);
        break;
      
      case 'status':
        await migrationManager.getMigrationStatus();
        break;
      
      case 'rollback':
        if (!arg) {
          console.error('❌ Please provide a migration version: pnpm migrate rollback 001_initial_schema');
          process.exit(1);
        }
        await migrationManager.rollbackMigration(arg);
        break;
      
      default:
        console.log(`
🗃️  Database Migration Tool

Usage:
  pnpm migrate run                    - Run all pending migrations
  pnpm migrate create <name>          - Create a new migration file
  pnpm migrate status                 - Show migration status
  pnpm migrate rollback <version>     - Rollback a specific migration

Examples:
  pnpm migrate create add_user_table
  pnpm migrate create add_game_players
  pnpm migrate run
  pnpm migrate status
  pnpm migrate rollback 002_add_user_table
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
