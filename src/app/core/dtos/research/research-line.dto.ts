import { LineStatus, DurationUnit } from '../../models/research/research-line.model';
import { StageQuestionDto } from './stage-question.dto';
import { ResearchTaskDto } from './research-task.dto';

export interface ResearchLineDto {
  id?: number;
  researchId: number;
  sequenceOrder: number;
  title: string;
  description?: string;
  durationValue?: number | null;
  durationUnit?: DurationUnit | null;
  status: LineStatus;

  /** Client-side nested collections (not sent to/from API) */
  stageQuestions?: StageQuestionDto[];
  tasks?: ResearchTaskDto[];
}
