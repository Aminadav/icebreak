# Question Flow for Others

## Overview
This document outlines how questions about other users work in the game, including the algorithm for mixing questions about yourself vs. questions about others.

## Flow for Non-Creators

### Initial Questions About Others
After **2FA verification** and before asking for email/name/image, non-creators receive **2 questions about other users** who have already answered questions about themselves.

**Requirements:**
- Questions are about users who have answered at least 1 question about themselves
- Use male/female variants based on the target user's gender
- Follow sensitivity progression: low → medium → high
- Track completion using `user_answers` table (not user activities)

### Mixed Question Algorithm

After completing profile setup (email, name, image), users enter the mixed question flow:

**Algorithm: "Discovery & Social Engagement"**
```
1. Try to alternate: self → other → self → other
2. Graceful fallback when one type is unavailable:
   - If no "about others" available → ask about self
   - If no "about self" available → ask about others  
   - If neither available → NO_MORE_QUESTIONS
3. Continue until both question types are exhausted
```

**Key Benefits:**
- **Sustained Engagement**: Game continues even after self-questions are exhausted
- **Social Discovery**: Users stay engaged to learn about others
- **Data Collection**: Maximizes answers for better game experience
- **Natural Progression**: No artificial limits, flows organically

## Question Selection Logic

### For Questions About Others
- **Target Users**: Must have answered ≥1 question about themselves
- **Exclusions**: Cannot ask about yourself
- **Sensitivity**: Low → Medium → High progression
- **Randomization**: Within same sensitivity level
- **Gender Variants**: Use `question_about_male` or `question_about_female` based on target user

### For Questions About Self
- **Standard Logic**: Same as existing `getNextQuestionAboutYou`
- **Sensitivity**: Low → Medium → High progression
- **Exclusions**: Questions already answered about yourself

## Database Tracking

### Question States
Questions are tracked in `user_answers` table:
- `answering_user_id`: Who answered the question
- `about_user_id`: Who the question is about
- `is_about_me`: Generated field (true when answering_user_id = about_user_id)

### Counting Functions
- `getAnswersAboutMyselfCount()`: Count of self-questions answered
- `getAnswersAboutOthersCount()`: Count of questions about others answered

## Screen Flow Integration

### New Screens
- `QUESTION_ABOUT_OTHERS`: Question about another user
- Uses existing `GOT_BADGE` for point awards

### Modified Logic in `get-next-screen-logic.js`
1. **After 2FA** (non-creators): Check if completed 2 initial "about others" questions
2. **After profile setup**: Enter mixed question algorithm
3. **Question Selection**: Balance between self and others based on availability

## Example Flow

**Non-Creator Journey:**
1. Join game → 2FA verification
2. **Question about Sarah** (low sensitivity)
3. **Question about David** (low sensitivity) 
4. Email → Name → Image setup
5. Mixed questions: Self → Other → Self → Other...
6. When self-questions exhausted: Only others
7. When both exhausted: Game complete

**Data Scenarios:**
- **Early Game**: Few others answered → More self-questions
- **Active Game**: Many users → Rich mix of both types
- **Late Game**: Self-questions done → Pure social discovery mode

## Technical Implementation

### Key Files
- `backend/utils/getNextQuestionAboutOthers.js`: Question selection for others
- `backend/routes/socket-handlers/get-next-screen-logic.js`: Screen flow logic
- `backend/utils/screenHistoryUtils.js`: Answer counting utilities

### Socket Events
- Existing: `submit-answer-myself` (questions about self)
- New: `submit-answer-others` (questions about others)

### Gender-Aware Questions
Questions support gender variants:
- `question_text`: Generic/fallback text
- `question_about_male`: When asking about male users
- `question_about_female`: When asking about female users
