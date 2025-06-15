-- Migration: 005_add_journey_state_to_devices
-- Description: add journey state to devices for user flow tracking
-- Date: 2025-06-15

-- Add journey_state column to track user progress through the app flow
ALTER TABLE devices ADD COLUMN IF NOT EXISTS journey_state VARCHAR(50) DEFAULT 'INITIAL';

-- Add index for better performance when filtering by journey state
CREATE INDEX IF NOT EXISTS idx_devices_journey_state ON devices(journey_state);

-- Add pending_game_name column to store game name temporarily
ALTER TABLE devices ADD COLUMN IF NOT EXISTS pending_game_name TEXT DEFAULT NULL;

-- Update existing devices to INITIAL state if not set
UPDATE devices SET journey_state = 'INITIAL' WHERE journey_state IS NULL;
