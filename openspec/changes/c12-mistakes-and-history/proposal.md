## Why

Users need to review their learning progress and focus on areas where they struggle. Providing a history of practice sessions and a dedicated "Mistake Set" (wrong questions collection) allows for targeted revision and better exam preparation.

## What Changes

- **Practice History**: Track and display all completed practice sessions with their scores and dates.
- **Mistake Set**: Automatically collect questions that were answered incorrectly during practice sessions.
- **Mistake Review**: Allow users to practice only the questions in their mistake set to reinforce learning.
- **Mistake Removal**: Allow users to remove questions from the mistake set once they have mastered them.

## Capabilities

### New Capabilities
- `practice-history`: View and manage past practice sessions and their results.
- `mistake-set-management`: Automatic collection and manual management (removal) of incorrectly answered questions.
- `mistake-review-practice`: A specialized practice mode for reviewing questions in the mistake set.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New table `wrong_questions` to track incorrectly answered questions per user.
- **Backend API**: New endpoints for fetching history, fetching wrong questions, and removing items from the mistake set.
- **Mini-program**: New pages for "Practice History" and "Mistake Set".
- **Mini-program Services**: Extension of `practice.ts` or a new `history.ts` service.
