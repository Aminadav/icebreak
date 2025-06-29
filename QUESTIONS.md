# Questions Table Documentation

## Overview
The `questions` table stores question templates for the Icebreak game. Each question can have multiple variants depending on who is being asked about.

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `question_id` | UUID | Primary key, auto-generated |
| `question_text` | TEXT | Main question text (for asking about yourself) |
| `question_about_male` | TEXT | Question variant when asking about a male person |
| `question_about_female` | TEXT | Question variant when asking about a female person |
| `question_type` | VARCHAR(20) | Type: `free_form` or `choose_one` |
| `answers` | JSONB | Array of possible answers (for `choose_one` type) |
| `allow_other` | BOOLEAN | Whether to allow "other" option (for `choose_one` type) |
| `sensitivity` | VARCHAR(10) | Sensitivity level: `low`, `medium`, `high` |
| `max_answers_to_show` | INTEGER | Maximum answers to display (default: 4) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Question Variants Explained

### 1. Questions About Yourself (`question_text`)
Used when users answer questions about themselves during onboarding.

**Example:**
```
"מה הייתם לוקחים אתכם לאי בודד?"
(What would you take with you to a deserted island?)
```

### 2. Questions About Males (`question_about_male`)
Used when asking users questions about other male participants.

**Example:**
```
"מה $1 היה לוקח איתו לאי בודד?"
(What would $1 take with him to a deserted island?)
```

### 3. Questions About Females (`question_about_female`)
Used when asking users questions about other female participants.

**Example:**
```
"מה $1 היתה לוקחת איתה לאי בודד?"
(What would $1 take with her to a deserted island?)
```

## Placeholder System

- `$1` is replaced with the person's name when the question is served
- The gender-specific grammar ensures natural Hebrew language flow

## Question Types

### Free Form (`free_form`)
- Users type their own answer
- No predefined options
- `answers` field is empty/null

### Choose One (`choose_one`)
- Users select from predefined options
- `answers` contains array of choices
- `allow_other` determines if custom text input is allowed

## Sensitivity Levels

- **Low (`low`)**: Can be shared with anyone (e.g., "Do you prefer orange juice or apple juice?")
- **Medium (`medium`)**: For people you know and feel comfortable with (e.g., "Where do you live?")
- **High (`high`)**: For people you trust and have a good relationship with (e.g., "What are your dreams? What are your failures?")

## Current Usage

### Implemented
- ✅ Questions about yourself (user onboarding flow)
- ✅ Admin interface for managing questions

### Future Implementation
- ⏳ Questions about other players (not yet implemented)
- ⏳ Gender-based question serving logic
- ⏳ Dynamic name replacement in questions

## Database Operations

Questions are managed through Socket.io events:
- `get_questions` - Fetch all questions
- `save_question` - Create/update question
- `delete_question` - Remove question

See AdminPage.tsx for the complete question management interface.
