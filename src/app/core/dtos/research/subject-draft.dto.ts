export interface SubjectDraft {
  code: string;
  remarks: string;
  kycVerified: boolean;
  parameterValues: { parameterId: string; value: number }[];
}
