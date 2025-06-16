-- Add original_image_hash field to user_generated_images table
-- This allows us to track which original image was used to generate each image

ALTER TABLE user_generated_images 
ADD COLUMN original_image_hash VARCHAR(255);

-- Add index for better query performance
CREATE INDEX idx_user_generated_images_original_hash 
ON user_generated_images(user_id, original_image_hash);

-- Update existing records to set a placeholder value
-- In practice, these might need to be regenerated or manually mapped
UPDATE user_generated_images 
SET original_image_hash = 'unknown' 
WHERE original_image_hash IS NULL;
