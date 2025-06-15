-- Migration: 004_add_email_constraints
-- Description: add email constraints
-- Date: 2025-06-15

-- Add case-insensitive index for email for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
