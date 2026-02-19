# ResearchFactor (RF-Protocol): Core Data Engine

## Project Context

A crowdfunded, publicly transparent platform for conducting independent Randomized Controlled Trials (RCTs) on pharmaceuticals and supplements. The platform creates an immutable, step-by-step record of the research process, enabling donors to fund and monitor studies in real time while PhD reviewers ensure methodological integrity.

This version focuses on **Research Definition** and **Execution** only (Review and Funding excluded).

---

## 1. Domain Entities (Core Hierarchy)

### A. Study (Research Project)
The top-level container for a scientific goal.
- `id`: UUID
- `title`: String
- `hypothesis`: String (The specific claim being tested)
- `description`: Markdown
- `blindingType`: `SINGLE_BLIND` (default, locked for now)
- `ethicsApprovalDocument`: Artifact (Required before activation)
- `subjectGroups`: SubjectGroup[] (Exactly 2: experimental + control)
- `trackedParameters`: TrackedParameter[] (Global list of measured metrics across all subjects)
- `lines`: ResearchLine[] (Ordered)

### B. SubjectGroup
One of two groups subjects are randomized into.
- `id`: UUID
- `label`: String (e.g., "Group A — Experimental", "Group B — Control")
- `subjects`: Subject[]

### C. Subject
A registered participant in the study.
- `id`: UUID
- `code`: String (Platform-assigned anonymous code, e.g., "SUB-0042")
- `group`: SubjectGroup (Assigned by platform randomization — seed recorded in audit trail)
- `parameterReadings`: ParameterReading[] (Time-series values for each TrackedParameter)

### D. TrackedParameter
A measurable metric monitored across all subjects throughout the study.
- `id`: UUID
- `name`: String (e.g., "Fasting glucose", "Body weight", "Sleep score")
- `unit`: String (e.g., "mmol/L", "kg", "points")

### E. ResearchLine (Phase)
A major block of work representing a specific experimental phase.
- `id`: UUID
- `sequenceOrder`: Integer (Determines execution flow)
- `title`: String (e.g., "Baseline measurement", "Intervention phase")
- `status`: `LOCKED | ACTIVE | COMPLETED`
- `stageQuestions`: StageQuestion[] (Pre-defined questions this phase must answer — immutable once approved)
- `objectives`: Objective[] (Expected outcomes for this line — immutable once ResearchLine starts)
- `tasks`: ResearchTask[]
- `report`: ResearchLineReport (Submitted by researcher to close the phase)

### F. StageQuestion
A pre-defined question formulated before the phase begins that the ResearchLineReport must answer.
- `id`: UUID
- `text`: String (e.g., "Is there a statistically significant difference in fasting glucose between Group A and Group B?")
- `status`: `DRAFT | APPROVED` (Frozen after PhD approval — cannot be modified)

### G. Objective
Pre-defined success criteria. Immutable once the ResearchLine starts.
- `id`: UUID
- `description`: String (e.g., "Glucose reduction > 10% vs baseline")
- `status`: `PENDING | FULFILLED | FAILED`

### H. ResearchTask (The "Action")
A granular entry in the lab journal.
- `id`: UUID
- `type`: `ONGOING | ONE_TIME` (Ongoing = continuous monitoring, One-time = discrete event e.g. blood draw)
- `status`: `DRAFT | SUBMITTED`
- `logEntries`: LogEntry[] (Real-time notes with immutable timestamps)
- `artifacts`: Artifact[]
- `subjectRefs`: Subject[] (Optional — which subjects this task relates to)

### I. ResearchLineReport
Submitted by the researcher to close a ResearchLine and trigger PhD review.
- `id`: UUID
- `summary`: String (Brief plain-language summary of what happened in this phase)
- `narrative`: Markdown (Full interpretation with inline references to specific tasks and log entries)
- `stageQuestionAnswers`: StageQuestionAnswer[] (Mandatory answer for each StageQuestion)
- `protocolDeviations`: String (Free text — required field, researcher must explicitly state "None" if applicable)
- `adverseEvents`: String (Free text — required field, researcher must explicitly state "None" if applicable)
- `nextPhaseRecommendation`: String (Optional — researcher's recommendation for the next ResearchLine)
- `submittedAt`: Timestamp (Backend-generated)

### J. StageQuestionAnswer
Researcher's explicit answer to a pre-defined StageQuestion.
- `id`: UUID
- `stageQuestion`: StageQuestion
- `answer`: Markdown (Researcher's response with optional inline references)

### K. Artifact (The "Evidence")
- `id`: UUID
- `type`: `RAW_DATA | PHOTO | CODE | CONFIG | ETHICS_APPROVAL | LAB_RESULT`
- `storageUrl`: String
- `sha256`: String (File integrity)
- `metadata`: Map<String, String> (Device IDs, environment specs, etc.)

### L. LogEntry
An immutable timestamped note within a ResearchTask. May include a ParameterReading.
- `id`: UUID
- `text`: String
- `parameterReading`: ParameterReading (Optional — links a measurement to this log entry)
- `createdAt`: Timestamp (Backend-generated, immutable)

### M. ParameterReading
A single measurement of a TrackedParameter for a specific Subject at a point in time.
- `id`: UUID
- `subject`: Subject
- `parameter`: TrackedParameter
- `value`: Decimal
- `recordedAt`: Timestamp

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
4. **Timestamp Integrity:** `LogEntry` and `ParameterReading` timestamps must be generated by the backend; frontend displays them in local time.
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
- Create `Study` → define hypothesis, subject groups, tracked parameters
- Add `ResearchLine` items in sequence order
- For each `ResearchLine`: define `StageQuestions` and `Objectives`
- Define `ResearchTask` set for each `ResearchLine`
- All data is editable in this phase
- Attach ethics approval document (required before Study can be submitted for review)

### Flow 2: Subject Registration & Randomization
- Subjects register on the platform and apply to the Study
- Platform performs randomization → assigns each Subject a code and a group
- Randomization seed recorded in audit trail
- Researcher sees subject codes only (group mapping visible after unblinding)

### Flow 3: Laboratory Work (Execution)
- Set `ResearchLine` to `ACTIVE`
- Add `LogEntries` to `ResearchTask` as work progresses (optionally attach `ParameterReading`)
- Upload `Artifacts` and link them to the task
- Final action per task: `SUBMIT_TASK`

### Flow 4: Phase Completion & Report Submission
- Researcher fills out `ResearchLineReport`:
    - Writes summary and narrative
    - Answers every `StageQuestion`
    - Declares protocol deviations and adverse events
- `ResearchLine` can be marked `COMPLETED` only if:
    - All `Objectives` have a status set
    - All `ResearchTask` items are `SUBMITTED`
    - All `StageQuestions` have answers
    - `protocolDeviations` and `adverseEvents` fields are filled
- Submission triggers PhD review of the phase

### Flow 5: Progress Tracking
- Per-phase graphs of `TrackedParameter` values aggregated by `SubjectGroup`
- Visible to Donors in real time
- `computed` signals drive progress indicators in UI

---

## 4. UI Architecture Guidelines
- **Vertical Pipeline:** Display `ResearchLines` as a vertical progression
- **Artifact Sidebar:** Context-aware panel showing files related to the selected `ResearchTask`
- **Parameter Dashboard:** Per-ResearchLine graphs showing tracked parameter dynamics split by group
- **Mobile-Friendly Inputs:** Focus on `LogEntry` input and Camera Upload for mobile lab work
- **No-Delete Policy:** Implement "Archive" or "Correction" logs instead of deleting entries to preserve audit trail