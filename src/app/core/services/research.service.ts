import {HttpClient} from '@angular/common/http';
import {computed, Injectable, signal, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {
  Research, ResearchLine, ResearchTask, StudyProtocol,
} from '../models/research.model';

export interface ResearchOverviewItem {
  id: string;
  title: string;
  userId: string;
  description?: string;
  status: string;
  researchLinesCount: number;
  primaryOutcomesCount: number;
  createdAt: string;
}

export interface SearchResultDto<T> {
  items: T[];
  hasMore: boolean;
}

export interface ResearchFilterDto {
  filter?: {
    title?: string;
    status?: string;
  };
  pagination?: {
    limit: number;
    startFrom?: string;
    order?: 'next' | 'prev';
  };
}

export interface ResearchCreateDto {
  title: string;
  hypothesis: string;
  description: string;
  protocol: ProtocolCreateDto;
  primaryOutcomes: PrimaryOutcomeCreateDto[];
  trackedParameters: TrackedParameterCreateDto[];
}

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

export interface SubjectGroupInput {
  label: string;
  description: string;
  subjects: SubjectInput[];
}

export interface SubjectInput {
  code: string;
  remarks: string;
  kycVerified: boolean;
  parameterValues: {parameterId: string; value: number}[];
}

export interface CreateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];
  subjectGroups: SubjectGroupInput[];
  trackedParameters: {name: string; unit: string}[];
}

export interface UpdateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];
  subjectGroups: SubjectGroupInput[];
  trackedParameters: {name: string; unit: string}[];
}

export interface AddLineInput {
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];
}

@Injectable({providedIn: 'root'})
export class ResearchService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;

  private _projects = signal<Research[]>(this.loadFromStorage());
  projects = computed(() => this._projects());

  getById(id: string): Research | undefined {
    return this._projects().find(p => p.id === id);
  }

  // ════════════ API Methods ════════════

  listResearch(filter: ResearchFilterDto): Observable<SearchResultDto<ResearchOverviewItem>> {
    let params: any = {};
    if (filter.pagination) {
      params['pagination.limit'] = filter.pagination.limit;
      if (filter.pagination.startFrom) params['pagination.startFrom'] = filter.pagination.startFrom;
      if (filter.pagination.order) params['pagination.order'] = filter.pagination.order;
    }
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;
    if (filter.filter?.status) params['filter.status'] = filter.filter.status;

    return this.http.get<SearchResultDto<ResearchOverviewItem>>(
      `${this.API_URL}api/v1/dashboard/research/list`,
      { params, withCredentials: true }
    );
  }

  countResearch(filter: ResearchFilterDto): Observable<{count: number}> {
    let params: any = {};
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;
    if (filter.filter?.status) params['filter.status'] = filter.filter.status;

    return this.http.get<{count: number}>(
      `${this.API_URL}api/v1/dashboard/research/count`,
      { params, withCredentials: true }
    );
  }

  // ════════════ Research CRUD ════════════

  saveNewResearch(research: ResearchCreateDto): Observable<{id: string}> {
    return this.http.post<{id: string}>(`${this.API_URL}api/v1/dashboard/research`, research, { withCredentials: true });
  }

  createResearch(input: CreateResearchInput): Research {
    const project: Research = {
      id: crypto.randomUUID(),
      title: input.title,
      hypothesis: input.hypothesis,
      description: input.description,
      status: 'DRAFT',
      ethicsApprovalDocument: null,
      subjectGroups: input.subjectGroups.map(g => ({
        id: crypto.randomUUID(),
        label: g.label,
        description: g.description,
        subjects: g.subjects.map(s => ({
          id: crypto.randomUUID(),
          code: s.code,
          remarks: s.remarks,
          kycVerified: s.kycVerified,
          groupId: '',
          parameterFields: s.parameterValues.map(pv => ({
            id: crypto.randomUUID(),
            parameterId: pv.parameterId,
            currentValue: pv.value,
            updatedAt: new Date().toISOString(),
          })),
        })),
      })),
      trackedParameters: input.trackedParameters.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        unit: p.unit,
      })),
      protocol: {
        id: crypto.randomUUID(),
        ...input.protocol,
      },
      primaryOutcomes: input.primaryOutcomes.map(text => ({
        id: crypto.randomUUID(),
        text,
        status: 'DRAFT' as const,
      })),
      lines: [],
      report: null,
      createdAt: new Date().toISOString(),
    };
    this._projects.update(list => [...list, project]);
    this.persist();
    return project;
  }

  updateResearch(id: string, input: UpdateResearchInput) {
    this.updateProject(id, p => ({
      ...p,
      title: input.title,
      hypothesis: input.hypothesis,
      description: input.description,
      protocol: {
        ...p.protocol,
        ...input.protocol,
      },
      primaryOutcomes: input.primaryOutcomes.map(text => {
        const existing = p.primaryOutcomes.find(o => o.text === text);
        return existing ?? {id: crypto.randomUUID(), text, status: 'DRAFT' as const};
      }),
      subjectGroups: input.subjectGroups.map(gi => {
        const existing = p.subjectGroups.find(g => g.label === gi.label);
        if (existing) {
          return {
            ...existing,
            description: gi.description,
            subjects: gi.subjects.map(si => {
              const existingSubject = existing.subjects.find(s => s.code === si.code);
              return existingSubject
                ? {...existingSubject, remarks: si.remarks, kycVerified: si.kycVerified,
                    parameterFields: si.parameterValues.map(pv => {
                      const ef = existingSubject.parameterFields.find(f => f.parameterId === pv.parameterId);
                      return ef ? {...ef, currentValue: pv.value} : {id: crypto.randomUUID(), parameterId: pv.parameterId, currentValue: pv.value, updatedAt: new Date().toISOString()};
                    })}
                : {id: crypto.randomUUID(), code: si.code, remarks: si.remarks, kycVerified: si.kycVerified, groupId: existing.id,
                    parameterFields: si.parameterValues.map(pv => ({id: crypto.randomUUID(), parameterId: pv.parameterId, currentValue: pv.value, updatedAt: new Date().toISOString()}))};
            }),
          };
        }
        return {
          id: crypto.randomUUID(), label: gi.label, description: gi.description,
          subjects: gi.subjects.map(si => ({
            id: crypto.randomUUID(), code: si.code, remarks: si.remarks, kycVerified: si.kycVerified, groupId: '',
            parameterFields: si.parameterValues.map(pv => ({id: crypto.randomUUID(), parameterId: pv.parameterId, currentValue: pv.value, updatedAt: new Date().toISOString()})),
          })),
        };
      }),
      trackedParameters: input.trackedParameters.map(tp => {
        const existing = p.trackedParameters.find(t => t.name === tp.name && t.unit === tp.unit);
        return existing ?? {id: crypto.randomUUID(), name: tp.name, unit: tp.unit};
      }),
    }));
  }

  submitForReview(id: string) {
    this.updateProject(id, p => ({
      ...p,
      status: 'PENDING_REVIEW',
    }));
  }

  deleteResearch(id: string) {
    this._projects.update(list => list.filter(p => p.id !== id));
    this.persist();
  }

  // ════════════ Lines ════════════

  addLine(projectId: string, input: AddLineInput): ResearchLine {
    const line: ResearchLine = {
      id: crypto.randomUUID(),
      sequenceOrder: (this.getById(projectId)?.lines.length ?? 0) + 1,
      title: input.title,
      description: input.description,
      duration: input.duration,
      status: 'LOCKED',
      stageQuestions: input.stageQuestions.map(text => ({
        id: crypto.randomUUID(),
        text,
        status: 'DRAFT' as const,
      })),
      tasks: [],
      objective: null,
    };
    this.updateProject(projectId, p => ({
      ...p,
      lines: [...p.lines, line],
    }));
    return line;
  }

  removeLine(projectId: string, lineId: string) {
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines
        .filter(l => l.id !== lineId)
        .map((l, i) => ({...l, sequenceOrder: i + 1})),
    }));
  }

  // ════════════ Tasks ════════════

  addTask(projectId: string, lineId: string, title: string): ResearchTask {
    const task: ResearchTask = {
      id: crypto.randomUUID(),
      title,
      description: '',
      done: false,
      status: 'DRAFT',
      logEntries: [],
      artifacts: [],
    };
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId ? {...l, tasks: [...l.tasks, task]} : l
      ),
    }));
    return task;
  }

  removeTask(projectId: string, lineId: string, taskId: string) {
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId
          ? {...l, tasks: l.tasks.filter(t => t.id !== taskId)}
          : l
      ),
    }));
  }

  // ════════════ Internal ════════════

  private updateProject(id: string, fn: (p: Research) => Research) {
    this._projects.update(list =>
      list.map(p => (p.id === id ? fn(p) : p))
    );
    this.persist();
  }

  private persist() {
    localStorage.setItem('rf_projects', JSON.stringify(this._projects()));
  }

  private loadFromStorage(): Research[] {
    try {
      const raw = localStorage.getItem('rf_projects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
