import { Artifact } from './artifact.model';

export interface ParameterChange {
  id: string;
  parameterId: string;
  previousValue: number;
  newValue: number;
}

export interface SubjectUpdate {
  id: string;
  subjectId: string;
  parameterChanges: ParameterChange[];
}

export interface LogEntry {
  id: string;
  text: string;
  subjectUpdates: SubjectUpdate[];
  artifacts: Artifact[];
  createdAt: string;
}
