## Context

The project already has a backend for starting practice sessions and submitting answers (C10). This design focuses on the frontend implementation of the practice page in the WeChat mini-program.

## Goals / Non-Goals

**Goals:**
- Implement a high-performance, smooth question-answering experience.
- Support single-choice, multiple-choice (later), and true/false questions.
- Maintain a local cache of the current question list and session state.
- Implement a reusable "Question Swiper" or transition mechanism for moving between questions.

**Non-Goals:**
- Offline practice support (requires network for submission).
- Detailed reporting (handled by a separate results page).

## Decisions

- **State Management**: Use a `currentQuestionIndex` to track progress and a `questions` array to store loaded question data.
- **Component Decomposition**:
  - `QuestionContent`: Renders stem and options.
  - `ActionFooter`: Contains navigation buttons and answer sheet toggle.
  - `AnswerSheet`: A popup/modal overlay for jumping between questions.
- **Auto-Submission**: For single-choice questions, implement an "Auto-next" option in user settings (from C10) that automatically submits and moves to the next question upon selection.
- **Navigation**: Use a `swiper` component for smooth horizontal transitions between questions if possible, or simple conditional rendering with animations.
- **Mode Logic**: Use URL parameters (`bankId`, `mode`, `sectionId`) to determine which questions to load via the `practiceService`.

## Risks / Trade-offs

- **[Risk] Rendering Performance with many questions** → Storing 100+ full question objects in page data might slow down `setData`. **Mitigation**: Only store IDs and minimal metadata in the main list, and fetch full question details (stem, options) as needed or in small batches.
- **[Risk] State Sync** → User answers must be synced with the backend. **Mitigation**: Proactively submit answers upon selection and handle network errors with retries.
