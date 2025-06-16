-- Migration: 014_add_generated_images_table
-- Description: Add table for storing AI-generated gallery images
-- Date: 2025-06-16

-- Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    original_image_hash VARCHAR(64) NOT NULL,
    generated_image_hash VARCHAR(64) NOT NULL,
    prompt_text TEXT NOT NULL,
    image_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_original_hash ON generated_images(original_image_hash);
CREATE INDEX IF NOT EXISTS idx_generated_images_generated_hash ON generated_images(generated_image_hash);

-- Create composite index for gallery queries
CREATE INDEX IF NOT EXISTS idx_generated_images_user_original ON generated_images(user_id, original_image_hash);
