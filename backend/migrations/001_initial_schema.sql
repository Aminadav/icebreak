-- Migration: 001_initial_schema
-- Description: Initial database schema with all tables and relationships
-- Date: 2025-06-15

-- Create UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table: users
-- Stores user information including phone, email, name, gender, and image status
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    phone_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    name VARCHAR(255),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    pending_image VARCHAR(64),
    has_image BOOLEAN DEFAULT false
);

-- Table: devices
-- Stores device information and user associations with journey state
CREATE TABLE IF NOT EXISTS devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    journey_state VARCHAR(50) DEFAULT 'INITIAL',
    pending_game_name TEXT,
    pending_phone_number VARCHAR(20) DEFAULT NULL,
    metadata JSONB,
    CONSTRAINT fk_devices_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Table: games
-- Stores game information including name, creator, and status
CREATE TABLE IF NOT EXISTS games (
    game_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    creator_user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_generated_images
-- Stores user's generated image processing status and selection
CREATE TABLE IF NOT EXISTS user_generated_images (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    image_hash VARCHAR(255) NOT NULL,
    prompt_used TEXT,
    prompt_index INTEGER,
    generation_status VARCHAR(50) DEFAULT 'generating',
    is_selected BOOLEAN DEFAULT false,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT user_generated_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table: schema_migrations
-- Tracks database migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_pending_image ON users(pending_image);

-- Devices table indexes
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_journey_state ON devices(journey_state);
CREATE INDEX IF NOT EXISTS idx_devices_pending_phone ON devices(pending_phone_number);

-- Games table indexes
CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);


-- User generated images table indexes
CREATE INDEX IF NOT EXISTS idx_user_generated_images_user_id ON user_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_status ON user_generated_images(generation_status);
