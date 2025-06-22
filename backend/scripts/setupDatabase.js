const pool = require('../config/database');
const MigrationManager = require('./MigrationManager');

async function setupDatabase() {
  try {
    const migrationManager = new MigrationManager();
    await migrationManager.runPendingMigrations();
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
