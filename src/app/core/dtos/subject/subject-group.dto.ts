import {Subject} from "../../models/research/subject.model";

export interface SubjectGroup {
  label: string;
  description: string;
  subjects: Subject[];
}

export interface SubjectGroupDto {
  id: number;
  researchId: number;
  userId: number;
  label: string;
  description: string | null;
}

export interface SubjectGroupCreateDto {
  researchId: number;
  label: string;
  description?: string | null;
}

export interface SubjectGroupUpdateDto {
  label: string;
  description?: string | null;
}
