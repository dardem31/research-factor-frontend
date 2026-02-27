import { TaskDraft } from './task-draft.dto';

export interface LineDraft {
  id?: number;
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];
  tasks: TaskDraft[];
}
