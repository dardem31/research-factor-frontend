import { PendingParamEdit } from './pending-param-edit.dto';

export interface PendingSubjectUpdate {
  subjectId: string;
  subjectCode: string;
  params: PendingParamEdit[];
  collapsed: boolean;
}
