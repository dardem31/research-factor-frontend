export interface ResearchOverviewItem {
  id: string;
  title: string;
  userId: string;
  description?: string;
  status: string;
  researchLinesCount: number;
  primaryOutcomesCount: number;
  createdAt: string;
}
