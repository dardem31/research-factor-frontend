import { StageQuestion } from './stage-question.model';
import { ResearchTask } from './research-task.model';
import { Objective } from './objective.model';

export type LineStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

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
