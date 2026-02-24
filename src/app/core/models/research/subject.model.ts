import { ParameterField } from './parameter-field.model';

export interface Subject {
  id: string;
  code: string;
  remarks: string;
  kycVerified: boolean;
  groupId: string;
  parameterFields: ParameterField[];
}
