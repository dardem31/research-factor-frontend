export interface Research {
  id: string;
  title: string;
  description: string;
  lines: ResearchLine[];
  createdAt: string;
}

export interface ResearchLine {
  id: string;
  sequenceOrder: number;
  title: string;
  status: LineStatus;
  objectives: Objective[];
  steps: ResearchStep[];
}

export type LineStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export interface Objective {
  id: string;
  description: string;
  status: ObjectiveStatus;
}

export type ObjectiveStatus = 'PENDING' | 'FULFILLED' | 'FAILED';

export interface ResearchStep {
  id: string;
  title: string;
  status: StepStatus;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}

export type StepStatus = 'DRAFT' | 'SUBMITTED';

export interface LogEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  fileName: string;
  storageUrl: string;
  sha256: string;
  metadata: Record<string, string>;
}

export type ArtifactType = 'RAW_DATA' | 'PHOTO' | 'CODE' | 'CONFIG';
