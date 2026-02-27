export interface StageQuestionDto {
    id?: number;
    researchLineId: number;
    text: string;
    status: 'DRAFT' | 'APPROVED';
}
