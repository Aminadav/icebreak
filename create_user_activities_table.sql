-- Create user_activities table to track screen visits and button clicks
CREATE TABLE IF NOT EXISTS "user_activities" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "game_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "activity_type" TEXT NOT NULL,
  "activity_name" TEXT NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_user_activities_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("game_id"),
  CONSTRAINT "fk_user_activities_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id")
);

-- Create indexes for better performance
CREATE INDEX idx_user_activities_game_user ON public.user_activities USING btree (game_id, user_id);
CREATE INDEX idx_user_activities_activity_type ON public.user_activities USING btree (activity_type);
CREATE INDEX idx_user_activities_activity_name ON public.user_activities USING btree (activity_name);
CREATE INDEX idx_user_activities_game_user_type_name ON public.user_activities USING btree (game_id, user_id, activity_type, activity_name);
