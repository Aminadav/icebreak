-- Migration: 006_add_pending_phone_to_devices
-- Description: Add pending phone number field to devices table for PHONE_SUBMITTED state
-- Date: 2025-06-15

-- Add pending_phone_number column to store phone number temporarily during verification
ALTER TABLE devices ADD COLUMN IF NOT EXISTS pending_phone_number VARCHAR(20) DEFAULT NULL;

-- Add index for better performance when querying by pending phone number
CREATE INDEX IF NOT EXISTS idx_devices_pending_phone ON devices(pending_phone_number);

-- Clear pending phone number for devices that are already verified (have user_id)
UPDATE devices SET pending_phone_number = NULL WHERE user_id IS NOT NULL;
