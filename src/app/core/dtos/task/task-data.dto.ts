import { LogEntry } from '../../models/research/log-entry.model';
import { Artifact } from '../../models/research/artifact.model';

export interface TaskData {
  title: string;
  description: string;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}
