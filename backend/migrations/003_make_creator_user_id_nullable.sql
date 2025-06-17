-- Migration: 003_make_creator_user_id_nullable
-- Description: Make creator_user_id nullable to support anonymous game creation
-- Date: 2025-06-17

-- Remove NOT NULL constraint from creator_user_id in games table
ALTER TABLE games ALTER COLUMN creator_user_id DROP NOT NULL;

-- Record this migration
INSERT INTO schema_migrations (version) VALUES ('003_make_creator_user_id_nullable');
