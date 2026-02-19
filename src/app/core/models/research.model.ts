// ════════════════════════════════════════════
// A. Research (Project)
// ════════════════════════════════════════════

export interface Research {
  id: string;
  title: string;
  hypothesis: string;
  description: string;
  status: ResearchStatus;
  ethicsApprovalDocument: Artifact | null;
  subjectGroups: SubjectGroup[];
  trackedParameters: TrackedParameter[];
  protocol: StudyProtocol;
  primaryOutcomes: PrimaryOutcome[];
  lines: ResearchLine[];
  report: ResearchReport | null;
  createdAt: string;
}

export type ResearchStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';

// ════════════════════════════════════════════
// B. StudyProtocol
// ════════════════════════════════════════════

export interface StudyProtocol {
  id: string;
  primaryOutcome: string;
  sampleSizeJustification: string;
  statisticalMethod: string;
  randomizationMethod: string;
  blindingDetails: string;
  interventionDescription: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  earlyStoppingCriteria: string;
}

// ════════════════════════════════════════════
// C. PrimaryOutcome
// ════════════════════════════════════════════

export interface PrimaryOutcome {
  id: string;
  text: string;
  status: PrimaryOutcomeStatus;
}

export type PrimaryOutcomeStatus = 'DRAFT' | 'APPROVED';

// ════════════════════════════════════════════
// D. SubjectGroup
// ════════════════════════════════════════════

export interface SubjectGroup {
  id: string;
  label: string;
  description: string;
  subjects: Subject[];
}


// ════════════════════════════════════════════
// E. Subject
// ════════════════════════════════════════════

export interface Subject {
  id: string;
  code: string;
  remarks: string;
  kycVerified: boolean;
  groupId: string;
  parameterFields: ParameterField[];
}

// ════════════════════════════════════════════
// F. ParameterField
// ════════════════════════════════════════════

export interface ParameterField {
  id: string;
  parameterId: string;
  currentValue: number;
  updatedAt: string;
}

// ════════════════════════════════════════════
// G. TrackedParameter
// ════════════════════════════════════════════

export interface TrackedParameter {
  id: string;
  name: string;
  unit: string;
}

// ════════════════════════════════════════════
// H. ResearchLine (Phase)
// ════════════════════════════════════════════

export interface ResearchLine {
  id: string;
  sequenceOrder: number;
  title: string;
  description: string;
  duration: string;
  status: LineStatus;
  stageQuestions: StageQuestion[];
  tasks: ResearchTask[];
  objective: Objective | null;
}

export type LineStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

// ════════════════════════════════════════════
// I. StageQuestion
// ════════════════════════════════════════════

export interface StageQuestion {
  id: string;
  text: string;
  status: StageQuestionStatus;
}

export type StageQuestionStatus = 'DRAFT' | 'APPROVED';

// ════════════════════════════════════════════
// J. ResearchTask
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
// K. LogEntry
// ════════════════════════════════════════════

export interface LogEntry {
  id: string;
  text: string;
  subjectUpdates: SubjectUpdate[];
  artifacts: Artifact[];
  createdAt: string;
}

// ════════════════════════════════════════════
// L. SubjectUpdate
// ════════════════════════════════════════════

export interface SubjectUpdate {
  id: string;
  subjectId: string;
  parameterChanges: ParameterChange[];
}

// ════════════════════════════════════════════
// M. ParameterChange
// ════════════════════════════════════════════

export interface ParameterChange {
  id: string;
  parameterId: string;
  previousValue: number;
  newValue: number;
}

// ════════════════════════════════════════════
// N. Objective
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
// O. StageQuestionAnswer
// ════════════════════════════════════════════

export interface StageQuestionAnswer {
  id: string;
  stageQuestionId: string;
  answer: string;
}

// ════════════════════════════════════════════
// P. ObjectiveReview
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
// Q. ResearchReport
// ════════════════════════════════════════════

export interface ResearchReport {
  id: string;
  summary: string;
  narrative: string;
  primaryOutcomeAnswers: PrimaryOutcomeAnswer[];
  protocolDeviations: string;
  adverseEvents: string;
  status: ResearchReportStatus;
  submittedAt: string;
  review: ResearchReportReview | null;
}

export type ResearchReportStatus = 'PENDING' | 'FULFILLED' | 'FAILED';

// ════════════════════════════════════════════
// R. PrimaryOutcomeAnswer
// ════════════════════════════════════════════

export interface PrimaryOutcomeAnswer {
  id: string;
  primaryOutcomeId: string;
  answer: string;
}

// ════════════════════════════════════════════
// S. ResearchReportReview
// ════════════════════════════════════════════

export interface ResearchReportReview {
  id: string;
  researchReportId: string;
  reviewerId: string;
  verdict: ReviewVerdict;
  comment: string;
  createdAt: string;
}

// ════════════════════════════════════════════
// T. Artifact
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
