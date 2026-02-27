export interface ResearchTaskDto {
    id?: number;
    researchLineId: number;
    title: string;
    description: string;
    status: 'OPEN' | 'SUBMITTED';
}
