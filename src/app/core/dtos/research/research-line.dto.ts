import { LineStatus } from '../../models/research/research-line.model';
import { StageQuestionDto } from './stage-question.dto';
import { ResearchTaskDto } from './research-task.dto';

export interface ResearchLineDto {
  id?: number;
  researchId: number;
  sequenceOrder: number;
  title: string;
  description?: string;
  duration?: string | null;
  status: LineStatus;
  plannedStartDate?: Date | string | null;
  plannedEndDate?: Date | string | null;

  /** Client-side nested collections (not sent to/from API) */
  stageQuestions?: StageQuestionDto[];
  tasks?: ResearchTaskDto[];
}
