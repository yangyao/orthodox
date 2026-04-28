## Why

To support interactive learning and progress tracking in the mini-program, the system needs to manage practice sessions. This allows users to start a practice, submit answers, and receive instant feedback and scoring.

## What Changes

- **Backend API Endpoints**: Implement new endpoints in the admin/backend to handle practice session lifecycle (creation, answer submission, results).
- **Database Schema**: Add a new schema to track user practice sessions and their individual answers.
- **Service Integration**: Create a service in the mini-program to communicate with these new endpoints.

## Capabilities

### New Capabilities
- `practice-session-management`: API and logic for starting, resuming, and submitting answers for a practice session.
- `practice-scoring`: Logic for calculating scores and providing feedback based on user answers.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New tables for `practice_sessions` and `practice_answers` in `admin/src/lib/schema/`.
- **API**: New routes under `/api/v1/practice/`.
- **Mini-program**: New service `miniprogram/services/practice.ts`.
