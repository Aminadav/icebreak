-- Migration: 005_add_questions_table
-- Description: add questions table
-- Date: 2025-06-18

-- Table: questions
-- Stores icebreaker questions with their types, options, and sensitivity levels
CREATE TABLE IF NOT EXISTS questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('free_form', 'choose_one')),
    answers JSONB, -- Array of strings for multiple choice options, null for free form
    allow_other BOOLEAN DEFAULT false, -- Allow custom answers for multiple choice
    sensitivity VARCHAR(10) NOT NULL CHECK (sensitivity IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at column
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_sensitivity ON questions(sensitivity);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
