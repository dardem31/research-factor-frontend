export interface ArtifactDto {
    id?: number;
    taskId: number;
    type: 'RAW_DATA' | 'PHOTO' | 'CODE' | 'CONFIG' | 'ETHICS_APPROVAL' | 'LAB_RESULT';
    storageUrl?: string | null;
    sha256?: string | null;
    metadata?: string | null;
    createdAt?: string | null;
}
