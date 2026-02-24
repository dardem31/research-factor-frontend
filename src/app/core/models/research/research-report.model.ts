import { ReviewVerdict } from './objective-review.model';

export interface PrimaryOutcomeAnswer {
  id: string;
  primaryOutcomeId: string;
  answer: string;
}

export interface ResearchReportReview {
  id: string;
  researchReportId: string;
  reviewerId: string;
  verdict: ReviewVerdict;
  comment: string;
  createdAt: string;
}

export type ResearchReportStatus = 'PENDING' | 'FULFILLED' | 'FAILED';

export interface ResearchReport {
  id: string;
  summary: string;
  narrative: string;
  primaryOutcomeAnswers: PrimaryOutcomeAnswer[];
  protocolDeviations: string;
  adverseEvents: string;
  status: ResearchReportStatus;
  submittedAt: string;
  review: ResearchReportReview | null;
}
