-- Migration: 007_add_name_gender_to_users
-- Description: Add name and gender fields to users table
-- Date: 2025-06-15

-- Add name and gender fields to users table
ALTER TABLE users ADD COLUMN name VARCHAR(255);
ALTER TABLE users ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female'));

-- Create index for faster gender queries
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);