export type StageQuestionStatus = 'DRAFT' | 'APPROVED';

export interface StageQuestion {
  id: string;
  text: string;
  status: StageQuestionStatus;
}
