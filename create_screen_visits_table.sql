-- Create screen_visits table for tracking user screen history
CREATE TABLE IF NOT EXISTS "screen_visits" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "game_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "state" JSONB NOT NULL,
  "screen_name" TEXT GENERATED ALWAYS AS ((state->>'screenName')::text) STORED,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "screen_visits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_screen_visits_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("game_id"),
  CONSTRAINT "fk_screen_visits_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id")
);

-- Indexes for fast queries
CREATE INDEX idx_screen_visits_game_user ON screen_visits (game_id, user_id);
CREATE INDEX idx_screen_visits_screen_name ON screen_visits (screen_name);
CREATE INDEX idx_screen_visits_game_user_screen ON screen_visits (game_id, user_id, screen_name);
CREATE INDEX idx_screen_visits_created_at ON screen_visits (created_at);
