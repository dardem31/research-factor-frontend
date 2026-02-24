import { TaskDraft } from './task-draft.dto';

export interface LineDraft {
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];
  tasks: TaskDraft[];
}
