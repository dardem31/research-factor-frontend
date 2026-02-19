// ════════════════════════════════════════════
// A. Research (Project)
// ════════════════════════════════════════════

export interface Research {
  id: string;
  title: string;
  hypothesis: string;
  description: string;
  blindingType: BlindingType;
  subjectGroups: SubjectGroup[];
  trackedParameters: TrackedParameter[];
  lines: ResearchLine[];
  createdAt: string;
}

export type BlindingType = 'SINGLE_BLIND';

// ════════════════════════════════════════════
// B. SubjectGroup
// ════════════════════════════════════════════

export interface SubjectGroup {
  id: string;
  label: string;
  subjects: Subject[];
}

// ════════════════════════════════════════════
// C. Subject
// ════════════════════════════════════════════

export interface Subject {
  id: string;
  code: string;
  groupId: string;
  parameterFields: ParameterField[];
}

// ════════════════════════════════════════════
// D. ParameterField
// ════════════════════════════════════════════

export interface ParameterField {
  id: string;
  parameterId: string;
  currentValue: number;
  updatedAt: string;
}

// ════════════════════════════════════════════
// E. TrackedParameter
// ════════════════════════════════════════════

export interface TrackedParameter {
  id: string;
  name: string;
  unit: string;
}

// ════════════════════════════════════════════
// F. ResearchLine (Phase)
// ════════════════════════════════════════════

export interface ResearchLine {
  id: string;
  sequenceOrder: number;
  title: string;
  description: string;
  status: LineStatus;
  stageQuestions: StageQuestion[];
  tasks: ResearchTask[];
  objective: Objective | null;
}

export type LineStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

// ════════════════════════════════════════════
// G. StageQuestion
// ════════════════════════════════════════════

export interface StageQuestion {
  id: string;
  text: string;
  status: StageQuestionStatus;
}

export type StageQuestionStatus = 'DRAFT' | 'APPROVED';

// ════════════════════════════════════════════
// H. ResearchTask
// ════════════════════════════════════════════

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  done: boolean;
  status: TaskStatus;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}

export type TaskStatus = 'DRAFT' | 'SUBMITTED';

// ════════════════════════════════════════════
// I. LogEntry
// ════════════════════════════════════════════

export interface LogEntry {
  id: string;
  text: string;
  subjectUpdates: SubjectUpdate[];
  artifacts: Artifact[];
  createdAt: string;
}

// ════════════════════════════════════════════
// J. SubjectUpdate
// ════════════════════════════════════════════

export interface SubjectUpdate {
  id: string;
  subjectId: string;
  parameterChanges: ParameterChange[];
}

// ════════════════════════════════════════════
// K. ParameterChange
// ════════════════════════════════════════════

export interface ParameterChange {
  id: string;
  parameterId: string;
  previousValue: number;
  newValue: number;
}

// ════════════════════════════════════════════
// L. Objective
// ════════════════════════════════════════════

export interface Objective {
  id: string;
  summary: string;
  narrative: string;
  stageQuestionAnswers: StageQuestionAnswer[];
  protocolDeviations: string;
  adverseEvents: string;
  nextPhaseRecommendation: string;
  status: ObjectiveStatus;
  submittedAt: string;
  review: ObjectiveReview | null;
}

export type ObjectiveStatus = 'PENDING' | 'FULFILLED' | 'FAILED';

// ════════════════════════════════════════════
// M. StageQuestionAnswer
// ════════════════════════════════════════════

export interface StageQuestionAnswer {
  id: string;
  stageQuestionId: string;
  answer: string;
}

// ════════════════════════════════════════════
// N. ObjectiveReview
// ════════════════════════════════════════════

export interface ObjectiveReview {
  id: string;
  objectiveId: string;
  reviewerId: string;
  verdict: ReviewVerdict;
  comment: string;
  createdAt: string;
}

export type ReviewVerdict = 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

// ════════════════════════════════════════════
// O. Artifact
// ════════════════════════════════════════════

export interface Artifact {
  id: string;
  type: ArtifactType;
  fileName: string;
  storageUrl: string;
  sha256: string;
  metadata: Record<string, string>;
}

export type ArtifactType =
  | 'RAW_DATA'
  | 'PHOTO'
  | 'CODE'
  | 'CONFIG'
  | 'ETHICS_APPROVAL'
  | 'LAB_RESULT';
