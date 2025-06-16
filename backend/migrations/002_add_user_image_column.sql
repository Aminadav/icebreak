-- Migration: 002_add_user_image_column
-- Description: add user image column
-- Date: 2025-06-16

-- Add image column to store the selected image hash
ALTER TABLE users ADD COLUMN IF NOT EXISTS image VARCHAR(64);

-- Create index for image column for better query performance
CREATE INDEX IF NOT EXISTS idx_users_image ON users(image);
