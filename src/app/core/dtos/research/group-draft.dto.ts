import { SubjectDraft } from './subject-draft.dto';

export interface GroupDraft {
  label: string;
  description: string;
  subjects: SubjectDraft[];
}
