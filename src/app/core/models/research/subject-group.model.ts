import { Subject } from './subject.model';

export interface SubjectGroup {
  id: string;
  label: string;
  description: string;
  subjects: Subject[];
}
