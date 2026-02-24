export type ArtifactType = 'RAW_DATA' | 'PHOTO' | 'CODE' | 'CONFIG' | 'ETHICS_APPROVAL' | 'LAB_RESULT';

export interface Artifact {
  id: string;
  type: ArtifactType;
  fileName: string;
  storageUrl: string;
  sha256: string;
  metadata: Record<string, string>;
}
