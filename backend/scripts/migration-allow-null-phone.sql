-- Migration: Allow NULL phone numbers for temporary users
-- This allows users to exist without phone numbers initially

-- Remove NOT NULL constraint from phone_number
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

-- The unique constraint will still work with NULL values (NULL != NULL in PostgreSQL)
-- so we don't need to change the unique constraint
