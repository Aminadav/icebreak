-- Migration: 009_add_pending_image_to_users
-- Description: Add pending_image field to users table for storing image hash during processing
-- Date: 2025-06-16

-- Add pending_image field to users table
ALTER TABLE users ADD COLUMN pending_image VARCHAR(64);

-- Create index for faster pending image queries
CREATE INDEX IF NOT EXISTS idx_users_pending_image ON users(pending_image);
