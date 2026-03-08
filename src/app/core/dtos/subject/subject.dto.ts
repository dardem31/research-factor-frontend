export interface SubjectDto {
  id: number;
  groupId: number;
  userId: number;
  code: string;
  status: string;
  withdrawalReason: string | null;
  withdrawalDate: string | null;
  parameterFields: ParameterFieldDto[];
}

export interface ParameterFieldDto {
  id?: number | null;
  parameterId: number;
  currentValue: string | null;
}

export interface SubjectCreateDto {
  groupId: number;
  code: string;
  parameterFields: ParameterFieldDto[];
}

export interface SubjectUpdateDto {
  groupId?: number | null;
  code?: string | null;
  status?: string | null;
  withdrawalReason?: string | null;
  withdrawalDate?: string | null;
  parameterFields?: ParameterFieldDto[] | null;
}
