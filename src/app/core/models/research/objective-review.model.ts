export type ReviewVerdict = 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface ObjectiveReview {
  id: string;
  objectiveId: string;
  reviewerId: string;
  verdict: ReviewVerdict;
  comment: string;
  createdAt: string;
}
