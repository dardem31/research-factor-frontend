export interface ParamDraft {
  name: string;
  unit: string;
}

export interface SubjectDraft {
  code: string;
  remarks: string;
  kycVerified: boolean;
  parameterValues: {parameterId: string; value: number}[];
}

export interface GroupDraft {
  label: string;
  description: string;
  subjects: SubjectDraft[];
}
