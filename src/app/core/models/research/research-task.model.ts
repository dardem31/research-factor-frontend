import { LogEntry } from './log-entry.model';
import { Artifact } from './artifact.model';

export type TaskStatus = 'DRAFT' | 'SUBMITTED';

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  done: boolean;
  status: TaskStatus;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}
