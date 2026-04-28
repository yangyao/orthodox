## Context

The system has a functional practice page (C11) and mock exam APIs (C13). This design focuses on creating the UI for mock exam selection and the specialized timed exam experience.

## Goals / Non-Goals

**Goals:**
- Create `pages/mock-list/` to browse and select mock papers.
- Create `pages/mock-exam/` by extending or adapting `pages/practice/`.
- Implement a countdown timer with server-side sync (via the start time from C13).
- Implement an auto-submission flow when time expires.

**Non-Goals:**
- Offline exam support.
- Complex resume-session logic (will focus on simple reload for now).

## Decisions

- **Page Architecture**:
  - `Mock List`: A standard list view using the `getMockPapers` service.
  - `Mock Exam`: Will reuse `QuestionRenderer` and `AnswerSheet` components. It will have a custom `navigation-bar` that displays the countdown timer.
- **Timer Management**: 
  - The timer will be initialized with `durationMinutes` from the session start response.
  - `remainingTime = (startTime + durationMinutes) - currentTime`.
  - A `setInterval` (or `requestAnimationFrame` for smoothness) will update the display.
- **Feedback Loop**:
  - In `mock` mode, the `submitAnswer` API call will be made as usual, but the UI will suppress the correct/incorrect colors and explanation display.
  - The "Next" button will be immediate (no 1s auto-next delay).
- **Auto-Submit**:
  - When the timer hits 0, the page will call `finishPracticeSession` and redirect to the results page.

## Risks / Trade-offs

- **[Risk] Timer inaccuracy on tab-out/background** → The app might pause. **Mitigation**: Use `onShow` to recalculate the remaining time against the server-provided `startTime` and current system time.
- **[Risk] User accidentally leaving the exam** → Potential data loss. **Mitigation**: Implement `wx.enableAlertBeforeUnload` to warn the user before they exit the exam page.
