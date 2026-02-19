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
- `status`: `DRAFT | PENDING_REVIEW | PUBLISHED | ACTIVE | COMPLETED`
- `ethicsApprovalDocument`: Artifact (Required before submission for review)
- `subjectGroups`: SubjectGroup[]
- `trackedParameters`: TrackedParameter[] (Global list of measured metrics across all subjects)
- `protocol`: StudyProtocol
- `primaryOutcomes`: PrimaryOutcome[] (Immutable once approved by PhD)
- `lines`: ResearchLine[] (Ordered)
- `report`: ResearchReport (Submitted after all ResearchLines are COMPLETED)

### B. StudyProtocol
The methodological specification of the research. Primary object of PhD review.
- `id`: UUID
- `primaryOutcome`: String (What constitutes success for this research)
- `sampleSizeJustification`: String (Power calculation and reasoning)
- `statisticalMethod`: String (e.g., "Two-tailed t-test", "ANOVA")
- `randomizationMethod`: String (e.g., "Block randomization")
- `blindingDetails`: String (Who knows group assignments and at what stage)
- `interventionDescription`: String (What each group receives)
- `inclusionCriteria`: String (Subject eligibility requirements)
- `exclusionCriteria`: String (Subject exclusion conditions)
- `earlyStoppingCriteria`: String (Conditions under which the study is halted)

### C. PrimaryOutcome
A pre-defined research-level question that the ResearchReport must answer. Immutable once approved.
- `id`: UUID
- `text`: String (e.g., "Does the intervention reduce fasting glucose by more than 10% compared to control after 12 weeks?")
- `status`: `DRAFT | APPROVED` (Frozen after PhD approval — cannot be modified)

### D. SubjectGroup
A named group that subjects are randomized into.
- `id`: UUID
- `label`: String (e.g., "Group A — Experimental", "Group B — Control")
- `subjects`: Subject[]

### E. Subject
A registered participant in the research.
- `id`: UUID
- `code`: String (Platform-assigned anonymous code, e.g., "SUB-0042")
- `group`: SubjectGroup (Assigned by platform randomization — seed recorded in audit trail)
- `parameterFields`: ParameterField[] (Current values of each TrackedParameter for this subject)
- `logs`: LogEntry[] (All log entries where this subject was @mentioned)

### F. ParameterField
The current state of a single TrackedParameter for a specific Subject.
- `id`: UUID
- `parameter`: TrackedParameter
- `currentValue`: Decimal
- `updatedAt`: Timestamp (Backend-generated on each update)

### G. TrackedParameter
A measurable metric monitored across all subjects throughout the research.
- `id`: UUID
- `name`: String (e.g., "Fasting glucose", "Body weight", "Sleep score")
- `unit`: String (e.g., "mmol/L", "kg", "points")

### H. ResearchLine (Phase)
A major block of work representing a specific experimental phase.
- `id`: UUID
- `sequenceOrder`: Integer (Determines execution flow)
- `title`: String (e.g., "Baseline measurement", "Intervention phase")
- `duration`: String (e.g., "4 weeks", "30 days")
- `status`: `LOCKED | ACTIVE | COMPLETED`
- `stageQuestions`: StageQuestion[] (Pre-defined questions this phase must answer — immutable once approved)
- `tasks`: ResearchTask[]
- `objective`: Objective (Submitted by researcher to close the phase)

### I. StageQuestion
A pre-defined question formulated before the phase begins that the Objective must answer.
- `id`: UUID
- `text`: String (e.g., "Is there a statistically significant difference in fasting glucose between groups at end of baseline?")
- `status`: `DRAFT | APPROVED` (Frozen after PhD approval — cannot be modified)

### J. ResearchTask (The "Action")
A granular entry in the lab journal.
- `id`: UUID
- `title`: String
- `logEntries`: LogEntry[]
- `artifacts`: Artifact[]

### K. LogEntry
An immutable timestamped note within a ResearchTask. Supports @mention of subjects with parameter updates.
- `id`: UUID
- `text`: String (Supports @mention of Subject codes)
- `subjectUpdates`: SubjectUpdate[] (Captured when a subject is @mentioned — stores parameter changes at the time of this log entry)
- `artifacts`: Artifact[]
- `createdAt`: Timestamp (Backend-generated, immutable)

### L. SubjectUpdate
A snapshot of parameter changes for a specific Subject, captured within a LogEntry at the moment of @mention.
- `id`: UUID
- `subject`: Subject
- `parameterChanges`: ParameterChange[]

### M. ParameterChange
A single parameter value recorded as part of a SubjectUpdate.
- `id`: UUID
- `parameter`: TrackedParameter
- `previousValue`: Decimal
- `newValue`: Decimal

### N. Objective
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

### O. StageQuestionAnswer
Researcher's explicit answer to a pre-defined StageQuestion.
- `id`: UUID
- `stageQuestion`: StageQuestion
- `answer`: Markdown

### P. ObjectiveReview
PhD reviewer's assessment of a submitted Objective.
- `id`: UUID
- `objective`: Objective
- `reviewer`: User (LEAD_PHD)
- `verdict`: `APPROVED | REJECTED | REVISION_REQUESTED`
- `comment`: Markdown
- `createdAt`: Timestamp (Backend-generated)

### Q. ResearchReport
Submitted by the researcher after all ResearchLines are COMPLETED. Closes the Research and triggers final PhD review.
- `id`: UUID
- `summary`: String (Plain-language summary of the overall research results)
- `narrative`: Markdown (Full interpretation with inline references to Objectives and key LogEntries)
- `primaryOutcomeAnswers`: PrimaryOutcomeAnswer[] (Mandatory answer for each PrimaryOutcome)
- `protocolDeviations`: String (Required — cumulative deviations across all phases, or "None")
- `adverseEvents`: String (Required — cumulative adverse events across all phases, or "None")
- `status`: `PENDING | FULFILLED | FAILED`
- `submittedAt`: Timestamp (Backend-generated)
- `review`: ResearchReportReview

### R. PrimaryOutcomeAnswer
Researcher's explicit answer to a pre-defined PrimaryOutcome.
- `id`: UUID
- `primaryOutcome`: PrimaryOutcome
- `answer`: Markdown

### S. ResearchReportReview
PhD reviewer's final assessment of the completed Research.
- `id`: UUID
- `researchReport`: ResearchReport
- `reviewer`: User (LEAD_PHD)
- `verdict`: `APPROVED | REJECTED | REVISION_REQUESTED`
- `comment`: Markdown
- `createdAt`: Timestamp (Backend-generated)

### T. Artifact (The "Evidence")
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
1. **StageQuestions & PrimaryOutcomes Frozen:** Once `status: APPROVED` they cannot be modified or deleted.
2. **ResearchLine Locked:** Once a line has `status: COMPLETED`, no `ResearchTask` can be added or modified.
3. **Task Submission:** Once a `ResearchTask` is `SUBMITTED`, all its `logEntries` and `artifacts` become `ReadOnly`.
4. **Timestamp Integrity:** `LogEntry` and `ParameterField` timestamps must be generated by the backend; frontend displays them in local time.
5. **Randomization Seed:** Subject-to-group assignment is performed by the platform; the seed is written to the audit trail at assignment time and is immutable.
6. **No LogEntry or Artifact before ACTIVE:** Creating `LogEntry` or `Artifact` is only permitted when `Research.status` is `ACTIVE`.

### Stack
- **Framework:** Angular 19+ (Signal-based) using Standalone Components
- **State Management:** Angular Signals + RxJS for Event Streams
- **Styling:** Tailwind CSS + Headless UI components
- **Communication:** REST API (Backend: Java/Spring Boot), WebSocket for Live Lab Logs
- **Security:** JWT + Role-Based Access Control (RBAC): `RESEARCHER | LEAD_PHD | SHADOW_PHD | DONOR | SUBJECT`

---

## 3. Workflow

### Flow 1: Construction (Setup — status: DRAFT)
**Step 1 — Research basics:**
- Fill `title`, `hypothesis`, `description`
- Fill `StudyProtocol` fields
- Define `TrackedParameter` list
- Attach `ethicsApprovalDocument`

**Step 2 — Research structure:**
- Add `ResearchLine` items in sequence order, each with `duration`
- For each `ResearchLine`: define `StageQuestions` and `ResearchTask` set
- Define `PrimaryOutcome` list for the Research
- `Objective`, `LogEntry`, `Artifact` cannot be created at this stage

**Step 3 — Groups and subjects (optional):**
- Create `SubjectGroup` items
- Register `Subject` items and assign to groups
- Can be done later — subjects can be added during `PUBLISHED` and `ACTIVE` phases

**Step 4 — Submit for review:**
- Research moves to `PENDING_REVIEW`
- All fields become read-only pending PhD decision

### Flow 2: PhD Protocol Review (status: PENDING_REVIEW)
- `LEAD_PHD` reviews `StudyProtocol`, `PrimaryOutcomes`, `StageQuestions` per line, `ResearchTask` structure
- On approval: `PrimaryOutcomes` and `StageQuestions` frozen (`status: APPROVED`), Research moves to `PUBLISHED`
- On rejection or revision request: Research returned to `DRAFT` with reviewer comments

### Flow 3: Subject Enrollment (status: PUBLISHED)
- Research visible to donors and prospective subjects
- Subjects register and apply
- Platform performs randomization → assigns code and group
- Randomization seed recorded in audit trail

### Flow 4: Laboratory Work (status: ACTIVE)
- Set first `ResearchLine` to `ACTIVE`
- Add `LogEntries` to `ResearchTask` items as work progresses
- @mention a subject → UI presents parameter update form → saved as `SubjectUpdate` inside `LogEntry` → `ParameterField` values on Subject updated
- Upload `Artifacts` and link to task or log entry
- Final action per task: `SUBMIT_TASK`

### Flow 5: Phase Completion — Objective Submission
- Researcher fills out `Objective` for the current `ResearchLine`:
    - Writes `summary` and `narrative`
    - Answers every `StageQuestion`
    - Declares `protocolDeviations` and `adverseEvents`
- Submission allowed only when all `ResearchTask` items are `SUBMITTED` and all `StageQuestions` answered
- Submission sets `Objective.status` to `PENDING` and triggers `ObjectiveReview` by PhD
- On `APPROVED`: `ResearchLine` marked `COMPLETED`, next line unlocks
- On `REJECTED`: `Objective.status` set to `FAILED`
- On `REVISION_REQUESTED`: researcher may edit and resubmit `Objective`

### Flow 6: Research Completion — ResearchReport Submission
- Triggered after all `ResearchLine` items are `COMPLETED`
- Researcher fills out `ResearchReport`:
    - Writes `summary` and `narrative`
    - Answers every `PrimaryOutcome`
    - Declares cumulative `protocolDeviations` and `adverseEvents`
- Submission triggers `ResearchReportReview` by PhD
- On `APPROVED`: `Research.status` set to `COMPLETED`
- On `REJECTED`: `ResearchReport.status` set to `FAILED`
- On `REVISION_REQUESTED`: researcher may edit and resubmit

### Flow 7: Progress Tracking
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