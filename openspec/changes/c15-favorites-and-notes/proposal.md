## Why

Users need a way to mark specific questions for future review and to record their own thoughts or explanations for complex problems. Adding "Favorites" and "Notes" features enhances the learning experience by allowing personalization and targeted study.

## What Changes

- **Question Favorites**: Users can toggle a favorite status for any question during practice or review.
- **Question Notes**: Users can add, edit, and view personal notes for any question.
- **Favorites List**: A new page to browse all favorited questions, filtered by question bank.
- **My Notes**: A way for users to browse all questions that have personal notes.

## Capabilities

### New Capabilities
- `question-favorites`: Toggle favorite status for questions and browse the favorites list.
- `question-notes`: Add and manage personal notes on a per-question basis.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New tables `favorites` and `notes` to store user-specific associations with questions.
- **Backend API**: New endpoints for managing favorites and notes.
- **Mini-program**: UI updates to `QuestionRenderer` to include favorite and note buttons; new pages for browsing favorites and notes.
