import { StudyProtocol } from '../../models/research/study-protocol.model';

export interface SubjectInput {
  code: string;
  remarks: string;
  kycVerified: boolean;
  parameterValues: { parameterId: string; value: number }[];
}

export interface SubjectGroupInput {
  label: string;
  description: string;
  subjects: SubjectInput[];
}

export interface CreateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];
  subjectGroups: SubjectGroupInput[];
  trackedParameters: { name: string; unit: string }[];
}

export interface UpdateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];
  subjectGroups: SubjectGroupInput[];
  trackedParameters: { name: string; unit: string }[];
}

export interface AddLineInput {
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];
}
