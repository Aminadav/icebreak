# Icebreak App Documentation

## Overview
Welcome to the Icebreak App documentation. This project creates an interactive social game where users answer questions about themselves and others to break the ice and get to know each other.

## Documentation Index

### Core Flows
- **[Game Creator Flow](GAME_CREATOR_FLOW.md)** - Complete user journey for game creators from first visit to game start
- **[Question About Others Flow](QUESTION_ABOUT_OTHERS_FLOW.md)** - How questions about other users work, including the mixed question algorithm

### Features & Systems  
- **[Points Implementation](POINTS_IMPLEMENTATION.md)** - Point system and badge mechanics
- **[Questions](QUESTIONS.md)** - Question management and types
- **[Testing Endpoints](TESTING_ENDPOINTS.md)** - API testing documentation

### Development
- **[Open Tasks](OPEN_TASKS.md)** - Current development tasks and priorities
- **[Links](LINKS.md)** - External resources and references

## Project Structure

```
icebreak-app/
├── frontend/          # React frontend application
├── backend/           # Node.js backend with Socket.IO
├── shared/            # Shared types and utilities
└── docs/             # Documentation files
```

## Quick Start

### Backend
```bash
cd backend
pnpm install
npm run dev
```

### Frontend  
```bash
cd frontend
pnpm install
npm run dev
```

## Key Features

- **Real-time multiplayer** using Socket.IO
- **Progressive question flow** with sensitivity levels
- **Mixed question algorithm** balancing self vs. others questions
- **Badge system** with point-based progression
- **Image generation** and profile management
- **2FA verification** via SMS

## Game Flow Overview

1. **Creator** creates game and completes profile
2. **Players** join via game link and verify phone
3. **Non-creators** answer 2 questions about others first
4. **Profile setup** (email, name, image)
5. **Mixed questions** alternating between self and others
6. **Continuous engagement** until all questions exhausted
