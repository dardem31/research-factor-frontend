import { ObjectiveReview } from './objective-review.model';

export interface StageQuestionAnswer {
  id: string;
  stageQuestionId: string;
  answer: string;
}

export type ObjectiveStatus = 'PENDING' | 'FULFILLED' | 'FAILED';

export interface Objective {
  id: string;
  summary: string;
  narrative: string;
  stageQuestionAnswers: StageQuestionAnswer[];
  protocolDeviations: string;
  adverseEvents: string;
  nextPhaseRecommendation: string;
  status: ObjectiveStatus;
  submittedAt: string;
  review: ObjectiveReview | null;
}
