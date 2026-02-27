import { LogEntry } from '../../models/research/log-entry.model';
import { Artifact } from '../../models/research/artifact.model';

export interface ResearchTaskDto {
    id?: number;
    researchLineId: number;
    title: string;
    description: string;
    status: 'OPEN' | 'SUBMITTED';

    /** Client-side nested collections (not sent to/from API) */
    logEntries?: LogEntry[];
    artifacts?: Artifact[];
}
