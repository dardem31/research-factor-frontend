export interface PendingParamEdit {
  parameterId: string;
  parameterName: string;
  parameterUnit: string;
  currentValue: number;
  newValue: number | null;
  enabled: boolean;
}
