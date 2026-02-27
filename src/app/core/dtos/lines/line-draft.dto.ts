import { TaskDraft } from './task-draft.dto';
import { StageQuestionDto } from '../research/stage-question.dto';

export interface LineDraft {
  id?: number;
  title: string;
  description: string;
  duration: string;
  stageQuestions: StageQuestionDto[];
  tasks: TaskDraft[];
}
