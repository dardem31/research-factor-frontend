export type BlindingType = 'OPEN_LABEL' | 'SINGLE_BLIND' | 'DOUBLE_BLIND' | 'TRIPLE_BLIND';

export interface ProtocolDto {
  id: number | null;
  primaryOutcome: string;
  sampleSizeJustification: string;
  statisticalMethod: string;
  randomizationMethod: string;
  blindingDetails: string;
  interventionDescription: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  earlyStoppingCriteria: string;
}

export interface PrimaryOutcomeDto {
  id: number | null;
  text: string;
}

export interface TrackedParameterDto {
  id: number | null;
  name: string;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
}

export interface ResearchDto {
  id: number | null;
  userId?: number;
  supervisorId?: number;
  title: string;
  hypothesis: string;
  description: string;
  blindingType: BlindingType;
  protocol: ProtocolDto;
  primaryOutcomes: PrimaryOutcomeDto[];
  trackedParameters: TrackedParameterDto[];
}
