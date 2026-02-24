import { ResearchStatus } from './research-status.model';
import { Artifact } from './artifact.model';
import { SubjectGroup } from './subject-group.model';
import { TrackedParameter } from './tracked-parameter.model';
import { StudyProtocol } from './study-protocol.model';
import { PrimaryOutcome } from './primary-outcome.model';
import { ResearchLine } from './research-line.model';
import {ResearchReport} from "./research-report.model";

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
