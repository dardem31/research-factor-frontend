# ResearchFactor (RF-Protocol): Core Data Engine

## Project Context

A crowdfunded, publicly transparent platform for conducting independent Randomized Controlled Trials (RCTs) on pharmaceuticals and supplements. The platform creates an immutable, step-by-step record of the research process, enabling donors to fund and monitor studies in real time while PhD reviewers ensure methodological integrity.

This version focuses on **Research Definition** and **Execution** only (Review and Funding excluded).

---

## 1. Domain Entities (Core Hierarchy)

### A. Research
The top-level container for a scientific goal.
- `id`: UUID
- `title`: String
- `hypothesis`: String (The specific claim being tested)
- `description`: Markdown
- `blindingType`: `SINGLE_BLIND` (default, locked for now)
- `ethicsApprovalDocument`: Artifact (Required before activation)
- `subjectGroups`: SubjectGroup[]
- `trackedParameters`: TrackedParameter[] (Global list of measured metrics across all subjects)
- `lines`: ResearchLine[] (Ordered)
  да - только не надо обновлять все readme
  дай только обновленную сущность Research и StudyProtocol
### B. SubjectGroup
A named group that subjects are randomized into.
- `id`: UUID
- `label`: String (e.g., "Group A — Experimental", "Group B — Control")
- `subjects`: Subject[]

### C. Subject
A registered participant in the Research.
- `id`: UUID
- `code`: String (Platform-assigned anonymous code, e.g., "SUB-0042")
- `group`: SubjectGroup (Assigned by platform randomization — seed recorded in audit trail)
- `parameterFields`: ParameterField[] (Current values of each TrackedParameter for this subject)
- `logs`: LogEntry[] (All log entries where this subject was @mentioned)

### D. ParameterField
The current state of a single TrackedParameter for a specific Subject.
- `id`: UUID
- `parameter`: TrackedParameter
- `currentValue`: Decimal
- `updatedAt`: Timestamp (Backend-generated on each update)

### E. TrackedParameter
A measurable metric monitored across all subjects throughout the Research.
- `id`: UUID
- `name`: String (e.g., "Fasting glucose", "Body weight", "Sleep score")
- `unit`: String (e.g., "mmol/L", "kg", "points")

### F. ResearchLine (Phase)
A major block of work representing a specific experimental phase.
- `id`: UUID
- `sequenceOrder`: Integer (Determines execution flow)
- `title`: String (e.g., "Baseline measurement", "Intervention phase")
- `status`: `LOCKED | ACTIVE | COMPLETED`
- `stageQuestions`: StageQuestion[] (Pre-defined questions this phase must answer — immutable once approved)
- `tasks`: ResearchTask[]
- `objective`: Objective (Submitted by researcher to close the phase)

### G. StageQuestion
A pre-defined question formulated before the phase begins that the Objective must answer.
- `id`: UUID
- `text`: String (e.g., "Is there a statistically significant difference in fasting glucose between Group A and Group B?")
- `status`: `DRAFT | APPROVED` (Frozen after PhD approval — cannot be modified)

### H. ResearchTask (The "Action")
A granular entry in the lab journal.
- `id`: UUID
- `title`: String
- `done`: Boolean
- `logEntries`: LogEntry[]
- `artifacts`: Artifact[]

### I. LogEntry
An immutable timestamped note within a ResearchTask. May include @mentions of subjects and corresponding parameter updates.
- `id`: UUID
- `text`: String (Supports @mention of Subject codes)
- `subjectUpdates`: SubjectUpdate[] (Captured when a subject is @mentioned — stores parameter changes at the time of this log entry)
- `artifacts`: Artifact[]
- `createdAt`: Timestamp (Backend-generated, immutable)

### J. SubjectUpdate
A snapshot of parameter changes for a specific Subject, captured within a LogEntry at the moment of @mention.
- `id`: UUID
- `subject`: Subject
- `parameterChanges`: ParameterChange[] (Which parameters changed and to what value)

### K. ParameterChange
A single parameter value recorded as part of a SubjectUpdate.
- `id`: UUID
- `parameter`: TrackedParameter
- `previousValue`: Decimal
- `newValue`: Decimal

### L. Objective
Submitted by the researcher to close a ResearchLine. Triggers PhD review.
- `id`: UUID
- `summary`: String (Brief plain-language summary of what happened in this phase)
- `narrative`: Markdown (Full interpretation with inline references to specific tasks and log entries)
- `stageQuestionAnswers`: StageQuestionAnswer[] (Mandatory answer for each StageQuestion)
- `protocolDeviations`: String (Required — researcher must explicitly state "None" if applicable)
- `adverseEvents`: String (Required — researcher must explicitly state "None" if applicable)
- `nextPhaseRecommendation`: String (Optional)
- `status`: `PENDING | FULFILLED | FAILED`
- `submittedAt`: Timestamp (Backend-generated)
- `review`: ObjectiveReview

### M. StageQuestionAnswer
Researcher's explicit answer to a pre-defined StageQuestion.
- `id`: UUID
- `stageQuestion`: StageQuestion
- `answer`: Markdown (Researcher's response with optional inline references)

### N. ObjectiveReview
PhD reviewer's assessment of a submitted Objective.
- `id`: UUID
- `objective`: Objective
- `reviewer`: User (LEAD_PHD)
- `verdict`: `APPROVED | REJECTED | REVISION_REQUESTED`
- `comment`: Markdown
- `createdAt`: Timestamp (Backend-generated)

### O. Artifact (The "Evidence")
- `id`: UUID
- `type`: `RAW_DATA | PHOTO | CODE | CONFIG | ETHICS_APPROVAL | LAB_RESULT`
- `storageUrl`: String
- `sha256`: String (File integrity)
- `metadata`: Map<String, String> (Device IDs, environment specs, etc.)

---

## 2. Technical Requirements (Angular 19+)

### State Management (Signals Only)
- Use `Signal` for all UI-bound data.
- Avoid `BehaviorSubject` and `subscriptions`.
- Implement `computed` values for progress tracking (e.g., `completedTasksPercent`, `answeredQuestionsPercent`).

### Immutability Rules
1. **StageQuestions Frozen:** Once a `StageQuestion` has `status: APPROVED` it cannot be modified or deleted.
2. **ResearchLine Locked:** Once a line has `status: COMPLETED`, no `ResearchTask` can be added or modified.
3. **Task Submission:** Once a `ResearchTask` is `SUBMITTED`, all its `logEntries` and `artifacts` become `ReadOnly`.
4. **Timestamp Integrity:** `LogEntry` and `ParameterField` timestamps must be generated by the backend; frontend displays them in local time.
5. **Randomization Seed:** Subject-to-group assignment is performed by the platform; the seed is written to the audit trail at assignment time and is immutable.

### Stack
- **Framework:** Angular 19+ (Signal-based) using Standalone Components
- **State Management:** Angular Signals + RxJS for Event Streams
- **Styling:** Tailwind CSS + Headless UI components
- **Communication:** REST API (Backend: Java/Spring Boot), WebSocket for Live Lab Logs
- **Security:** JWT + Role-Based Access Control (RBAC): `RESEARCHER | LEAD_PHD | SHADOW_PHD | DONOR | SUBJECT`

---

## 3. Workflow

### Flow 1: Construction (Setup)
- Create `Research` → define hypothesis, subject groups, tracked parameters
- Add `ResearchLine` items in sequence order
- For each `ResearchLine`: define `StageQuestions`
- Define `ResearchTask` set for each `ResearchLine`
- All data is editable in this phase
- Attach ethics approval document (required before Research can be submitted for review)

### Flow 2: Subject Registration & Randomization
- Subjects register on the platform and apply to the Research
- Platform performs randomization → assigns each Subject a code and a group
- Randomization seed recorded in audit trail
- Researcher sees subject codes only (group mapping visible after unblinding)

### Flow 3: Laboratory Work (Execution)
- Set `ResearchLine` to `ACTIVE`
- Add `LogEntries` to `ResearchTask` as work progresses
- @mention a subject in a log entry → UI presents parameter update form → changes saved as `SubjectUpdate` inside the `LogEntry` → `ParameterField` values on the Subject profile updated accordingly
- Upload `Artifacts` and link them to the task or directly to a log entry
- Final action per task: `SUBMIT_TASK`

### Flow 4: Phase Completion — Objective Submission
- Researcher fills out `Objective`:
    - Writes summary and narrative
    - Answers every `StageQuestion`
    - Declares protocol deviations and adverse events
- `ResearchLine` can be marked `COMPLETED` only if:
    - All `ResearchTask` items are `SUBMITTED`
    - All `StageQuestions` have answers
    - `protocolDeviations` and `adverseEvents` fields are explicitly filled
- Submission sets `Objective.status` to `PENDING` and triggers PhD review

### Flow 5: PhD Review
- `LEAD_PHD` reviews the `Objective` — reads summary, narrative, StageQuestion answers
- `LEAD_PHD` has full read access to all `ResearchTask` content and graphs for this phase
- `LEAD_PHD` submits `ObjectiveReview` with verdict:
    - `APPROVED` → ResearchLine is marked `COMPLETED`, next line unlocks
    - `REJECTED` → Objective.status set to `FAILED`
    - `REVISION_REQUESTED` → Researcher receives feedback, may resubmit

### Flow 6: Progress Tracking
- Per-phase graphs of `ParameterField` current values aggregated by `SubjectGroup`
- History reconstructable from `SubjectUpdate` records inside `LogEntry` items
- Visible to Donors in real time
- `computed` signals drive progress indicators in UI

---

## 4. UI Architecture Guidelines
- **Vertical Pipeline:** Display `ResearchLines` as a vertical progression
- **Artifact Sidebar:** Context-aware panel showing files related to the selected `ResearchTask`
- **Parameter Dashboard:** Per-ResearchLine graphs showing tracked parameter dynamics split by group
- **Subject Profile Panel:** Shows current `ParameterField` values + full `logs` history for a subject
- **@mention Flow:** Typing `@` in a `LogEntry` input triggers subject search → on selection, parameter update form slides in → saved as `SubjectUpdate`
- **Mobile-Friendly Inputs:** Focus on `LogEntry` input and Camera Upload for mobile lab work
- **No-Delete Policy:** Implement "Archive" or "Correction" logs instead of deleting entries to preserve audit trail