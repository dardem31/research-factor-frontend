import { StageQuestion } from './stage-question.model';
import { ResearchTask } from './research-task.model';
import { Objective } from './objective.model';

export type LineStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export type DurationUnit = 'DAYS' | 'WEEKS' | 'MONTHS';

/** Mapping for duration units display labels */
export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  DAYS: 'Дней',
  WEEKS: 'Недель',
  MONTHS: 'Месяцев'
};

export interface ResearchLine {
  id: string;
  sequenceOrder: number;
  title: string;
  description: string;
  durationValue?: number | null;
  durationUnit?: DurationUnit | null;
  status: LineStatus;
  stageQuestions: StageQuestion[];
  tasks: ResearchTask[];
  objective: Objective | null;
}
