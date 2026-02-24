export interface ResearchFilterDto {
  filter?: {
    title?: string;
    status?: string;
  };
  pagination?: {
    limit: number;
    startFrom?: string;
    order?: 'next' | 'prev';
  };
}
