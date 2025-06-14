-- יצירת מסד הנתונים עם תמיכה מלאה בUTF-8, עברית ואימוג'ים
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- טבלת מכשירים
CREATE TABLE devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת משחקים
CREATE TABLE games (
    game_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    creator_user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- אינדקסים לביצועים טובים יותר
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_games_creator ON games(creator_user_id);
CREATE INDEX idx_games_status ON games(status);

-- הגדרת תמיכה ב UTF-8 עבור כל הטבלאות
ALTER DATABASE icebreak_db SET client_encoding TO 'UTF8';
