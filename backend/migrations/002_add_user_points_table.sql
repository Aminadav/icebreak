-- Migration: 002_add_user_points_table
-- Description: Add user points table for tracking points per user per game
-- Date: 2025-06-17

-- Table: user_points
-- Stores points for each user in each game
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    game_id UUID NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_points_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_points_game_id FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_game_points UNIQUE (user_id, game_id)
);

-- Trigger to update updated_at column
CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_game_id ON user_points(game_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points);
CREATE INDEX IF NOT EXISTS idx_user_points_user_game ON user_points(user_id, game_id);
