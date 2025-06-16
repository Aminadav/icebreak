-- Migration: 013_add_image_original_to_users
-- Description: Add image_original field to users table for storing original uploaded image hash
-- Date: 2025-06-16

-- Add image_original field to users table
ALTER TABLE users ADD COLUMN image_original VARCHAR(64);

-- Create index for faster image queries
CREATE INDEX IF NOT EXISTS idx_users_image_original ON users(image_original);
