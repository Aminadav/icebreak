CREATE TABLE screen_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(game_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calc_screen_name TEXT GENERATED ALWAYS AS ((state->>'screenName')::text) STORED
);

-- Indexes for fast querying
CREATE INDEX idx_screen_visits_game_user ON screen_visits(game_id, user_id);
CREATE INDEX idx_screen_visits_calc_screen_name ON screen_visits(calc_screen_name);
CREATE INDEX idx_screen_visits_game_user_screen ON screen_visits(game_id, user_id, calc_screen_name);
CREATE INDEX idx_screen_visits_created_at ON screen_visits(created_at);
