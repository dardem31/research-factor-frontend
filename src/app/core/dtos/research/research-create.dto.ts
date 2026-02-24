export type BlindingType = 'OPEN_LABEL' | 'SINGLE_BLIND' | 'DOUBLE_BLIND' | 'TRIPLE_BLIND';

export interface ProtocolCreateDto {
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

export interface PrimaryOutcomeCreateDto {
  text: string;
}

export interface TrackedParameterCreateDto {
  name: string;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
}

export interface ResearchCreateDto {
  title: string;
  hypothesis: string;
  description: string;
  blindingType: BlindingType;
  protocol: ProtocolCreateDto;
  primaryOutcomes: PrimaryOutcomeCreateDto[];
  trackedParameters: TrackedParameterCreateDto[];
}
