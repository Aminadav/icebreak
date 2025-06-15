# Database Migrations

This directory contains database migration files for the Icebreak app.

## Migration System

The migration system tracks database schema changes and ensures they are applied consistently across all environments (development, staging, production).

### How it works

1. **Migration Files**: Each migration is a SQL file with a numbered prefix (e.g., `001_initial_schema.sql`)
2. **Tracking Table**: The `schema_migrations` table tracks which migrations have been executed
3. **Sequential Execution**: Migrations run in order based on their numeric prefix
4. **Transactional**: Each migration runs in a transaction and rolls back on error

### Commands

```bash
# Run all pending migrations
pnpm migrate:run

# Create a new migration
pnpm migrate:create add_user_table

# Check migration status
pnpm migrate:status

# Rollback a specific migration (removes from tracking only)
pnpm migrate:rollback 002_add_user_table

# Show help
pnpm migrate
```

### Creating Migrations

When you need to modify the database schema:

1. **Create a new migration**:
   ```bash
   pnpm migrate:create add_game_players_table
   ```

2. **Edit the generated file** in `backend/migrations/`:
   ```sql
   -- Migration: 002_add_game_players_table
   -- Description: add game players table
   -- Date: 2025-06-15

   CREATE TABLE IF NOT EXISTS game_players (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       game_id UUID NOT NULL REFERENCES games(game_id),
       user_id UUID NOT NULL,
       joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
   CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
   ```

3. **Run the migration**:
   ```bash
   pnpm migrate:run
   ```

### Best Practices

1. **Always use transactions**: Migrations run in transactions automatically
2. **Make migrations idempotent**: Use `IF NOT EXISTS` when possible
3. **Test migrations**: Test on development before deploying
4. **Backup before migrations**: Always backup production data
5. **One logical change per migration**: Keep migrations focused
6. **Add indexes**: Remember to add necessary indexes for performance

### Deployment

In production environments:

1. **Stop the application**
2. **Backup the database**
3. **Run migrations**: `pnpm migrate:run`
4. **Start the application**

### Migration Files Naming Convention

- Format: `XXX_description.sql`
- XXX: 3-digit number (001, 002, 003...)
- description: Snake_case description of the change
- Examples:
  - `001_initial_schema.sql`
  - `002_add_game_players_table.sql`
  - `003_add_user_preferences.sql`
  - `004_add_game_settings_column.sql`

### Rollbacks

⚠️ **Important**: The rollback command only removes the migration from the tracking table. You need to manually create a new migration to reverse schema changes if needed.

Example rollback migration:
```sql
-- Migration: 005_rollback_game_settings
-- Description: Remove game settings column
-- Date: 2025-06-15

ALTER TABLE games DROP COLUMN IF EXISTS settings;
```
