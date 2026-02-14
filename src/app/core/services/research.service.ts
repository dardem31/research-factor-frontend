import {computed, Injectable, signal} from '@angular/core';
import {Research, ResearchLine, ResearchStep, Objective} from '../models/research.model';

@Injectable({providedIn: 'root'})
export class ResearchService {
  private _projects = signal<Research[]>(this.loadFromStorage());
  projects = computed(() => this._projects());

  /** Get single project by id */
  getById(id: string): Research | undefined {
    return this._projects().find(p => p.id === id);
  }

  /** Create new research project */
  createResearch(title: string, description: string): Research {
    const project: Research = {
      id: crypto.randomUUID(),
      title,
      description,
      lines: [],
      createdAt: new Date().toISOString(),
    };
    this._projects.update(list => [...list, project]);
    this.persist();
    return project;
  }

  /** Add a ResearchLine to a project */
  addLine(projectId: string, title: string, objectives: string[]): ResearchLine {
    const line: ResearchLine = {
      id: crypto.randomUUID(),
      sequenceOrder: (this.getById(projectId)?.lines.length ?? 0) + 1,
      title,
      status: 'LOCKED',
      objectives: objectives.map(desc => ({
        id: crypto.randomUUID(),
        description: desc,
        status: 'PENDING' as const,
      })),
      steps: [],
    };
    this.updateProject(projectId, p => ({
      ...p,
      lines: [...p.lines, line],
    }));
    return line;
  }

  /** Add a ResearchStep to a ResearchLine */
  addStep(projectId: string, lineId: string, title: string): ResearchStep {
    const step: ResearchStep = {
      id: crypto.randomUUID(),
      title,
      status: 'DRAFT',
      logEntries: [],
      artifacts: [],
    };
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId ? {...l, steps: [...l.steps, step]} : l
      ),
    }));
    return step;
  }

  /** Delete research project */
  deleteResearch(id: string) {
    this._projects.update(list => list.filter(p => p.id !== id));
    this.persist();
  }

  /** Remove a line from a project */
  removeLine(projectId: string, lineId: string) {
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines
        .filter(l => l.id !== lineId)
        .map((l, i) => ({...l, sequenceOrder: i + 1})),
    }));
  }

  /** Remove a step from a line */
  removeStep(projectId: string, lineId: string, stepId: string) {
    this.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId
          ? {...l, steps: l.steps.filter(s => s.id !== stepId)}
          : l
      ),
    }));
  }

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
