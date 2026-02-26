export type BlindingType = 'OPEN_LABEL' | 'SINGLE_BLIND' | 'DOUBLE_BLIND' | 'TRIPLE_BLIND';

export interface ProtocolDto {
  id: number;
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
  id: number;
  text: string;
}

export interface TrackedParameterDto {
  id: number;
  name: string;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
}

export interface ResearchDto {
  id: number;
  title: string;
  hypothesis: string;
  description: string;
  blindingType: BlindingType;
  protocol: ProtocolDto;
  primaryOutcomes: PrimaryOutcomeDto[];
  trackedParameters: TrackedParameterDto[];
}
