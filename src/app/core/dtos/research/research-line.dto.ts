import { LineStatus } from '../../models/research/research-line.model';

export interface ResearchLineDto {
  id?: number;
  researchId: number;
  sequenceOrder: number;
  title: string;
  duration?: string | null;
  status: LineStatus;
  plannedStartDate?: Date | string | null;
  plannedEndDate?: Date | string | null;
}
