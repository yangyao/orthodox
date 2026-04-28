## Why

Users need an interactive interface to answer questions from the question banks. This page is the core value proposition of the mini-program, allowing users to practice in different modes (sequential, random, and by chapter) to improve their exam readiness.

## What Changes

- **Practice Page Implementation**: Create a new page `miniprogram/pages/practice/` that handles the question answering UI, including the question stem, options, and feedback.
- **Mode Selection Support**: Implement logic to load questions based on the selected mode (Sequential, Random, or Chapter).
- **Interactive Feedback**: Real-time display of correctness, correct answers, and explanations upon submission.
- **Progress Tracking**: Display current progress (e.g., 5/20) and allow navigation between questions.
- **Answer Sheet**: A quick-access sheet to view all questions in the session and jump to specific ones.

## Capabilities

### New Capabilities
- `practice-ui`: The core question-answering interface including stem, options, and interactive states.
- `practice-navigation`: Logic and UI for moving between questions and viewing the answer sheet.
- `practice-mode-logic`: Loading and filtering questions based on user-selected modes (sequential, random, chapter).

### Modified Capabilities
<!-- None -->

## Impact

- **Mini-program Pages**: New page `miniprogram/pages/practice/`.
- **Mini-program Components**: New components for Question Stem, Option List, and Answer Sheet.
- **Mini-program Services**: Integration with `practice.ts` (created in C10) to manage session state and submissions.
