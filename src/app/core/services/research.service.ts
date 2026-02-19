import {computed, Injectable, signal} from '@angular/core';
import {
  Research, ResearchLine, ResearchTask, StudyProtocol,
} from '../models/research.model';

export interface CreateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];         // question texts
  subjectGroups: string[];           // labels only
  trackedParameters: {name: string; unit: string}[];
}

export interface UpdateResearchInput {
  title: string;
  hypothesis: string;
  description: string;
  protocol: Omit<StudyProtocol, 'id'>;
  primaryOutcomes: string[];         // full list — reconciled with existing
  subjectGroups: string[];           // labels only — reconciled with existing
  trackedParameters: {name: string; unit: string}[];
}

export interface AddLineInput {
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];          // question texts
}

@Injectable({providedIn: 'root'})
export class ResearchService {
  private _projects = signal<Research[]>(this.loadFromStorage());
  projects = computed(() => this._projects());

  getById(id: string): Research | undefined {
    return this._projects().find(p => p.id === id);
  }

  // ════════════ Research CRUD ════════════

  createResearch(input: CreateResearchInput): Research {
    const project: Research = {
      id: crypto.randomUUID(),
      title: input.title,
      hypothesis: input.hypothesis,
      description: input.description,
      status: 'DRAFT',
      ethicsApprovalDocument: null,
      subjectGroups: input.subjectGroups.map(label => ({
        id: crypto.randomUUID(),
        label,
        subjects: [],
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
      subjectGroups: input.subjectGroups.map(label => {
        const existing = p.subjectGroups.find(g => g.label === label);
        return existing ?? {id: crypto.randomUUID(), label, subjects: []};
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
