import { ParameterField } from '../../models/research/parameter-field.model';

export interface MentionableSubject {
  id: string;
  code: string;
  parameterFields: ParameterField[];
}
