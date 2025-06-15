-- Migration: 003_add_email_fields_to_users
-- Description: Add email and email_verified fields to users table
-- Date: 2025-06-15

-- Add email fields to users table
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
