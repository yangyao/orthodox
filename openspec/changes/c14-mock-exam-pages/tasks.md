## 1. Mock Paper Selection

- [x] 1.1 Create `pages/mock-list/` page structure (json, wxml, less, ts).
- [x] 1.2 Implement mock paper listing using `getMockPapers` service.
- [x] 1.3 Add "Exam Instructions" modal/overlay with paper details.
- [x] 1.4 Register the new page in `app.json`.

## 2. Timed Exam Page

- [x] 2.1 Create `pages/mock-exam/` (can start by duplicating `pages/practice/`).
- [x] 2.2 Implement countdown timer logic with `onShow` sync.
- [x] 2.3 Modify UI to suppress immediate answer feedback and auto-next delay in `mock` mode.
- [x] 2.4 Implement `auto-submit` trigger when the timer expires.
- [x] 2.5 Add `alertBeforeUnload` to prevent accidental exit.

## 3. Results and History Updates

- [x] 3.1 Update `pages/results/` to display mock-specific results (Pass/Fail).
- [x] 3.2 Update `pages/history/` to show "Mock Exam" tags and pass status.
- [x] 3.3 Ensure the "Mine" page correctly routes to the new history view.

## 4. Navigation Integration

- [x] 4.1 Update `pages/index/` and `pages/bank-detail/` to route to the mock list.
- [x] 4.2 Verify the end-to-end flow from selecting a paper to finishing an exam.
