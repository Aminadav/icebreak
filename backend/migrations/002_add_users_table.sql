-- Migration: 002_add_users_table
-- Description: Add users table and update devices table
-- Date: 2025-06-15

-- Clear existing devices data since we're starting fresh
DELETE FROM games; -- Clear games first due to foreign key
DELETE FROM devices; -- Clear devices

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to devices table
ALTER TABLE devices ADD CONSTRAINT fk_devices_user_id 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
