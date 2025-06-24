CREATE TABLE IF NOT EXISTS badges (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  game_id UUID NOT NULL,
  badge_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT badges_pkey PRIMARY KEY (id),
  CONSTRAINT fk_badges_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_badges_game_id FOREIGN KEY (game_id) REFERENCES games(game_id),
  CONSTRAINT unique_user_game_badge UNIQUE (user_id, game_id, badge_id)
);

CREATE INDEX idx_badges_user_id ON badges USING btree (user_id);
CREATE INDEX idx_badges_game_id ON badges USING btree (game_id);
CREATE INDEX idx_badges_badge_id ON badges USING btree (badge_id);
