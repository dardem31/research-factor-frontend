export type PrimaryOutcomeStatus = 'DRAFT' | 'APPROVED';

export interface PrimaryOutcome {
  id: string;
  text: string;
  status: PrimaryOutcomeStatus;
}
