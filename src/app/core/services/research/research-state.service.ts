import { Injectable, computed, signal } from '@angular/core';
import { Research } from '../../models/research/research.model';

/**
 * Local state management for research (legacy localStorage-based storage)
 * @deprecated This will be replaced by server-side state management
 */
@Injectable({ providedIn: 'root' })
export class ResearchStateService {
  private _projects = signal<Research[]>(this.loadFromStorage());
  projects = computed(() => this._projects());

  getById(id: string): Research | undefined {
    return this._projects().find(p => p.id === id);
  }

  addProject(project: Research): void {
    this._projects.update(list => [...list, project]);
    this.persist();
  }

  updateProject(id: string, fn: (p: Research) => Research): void {
    this._projects.update(list =>
      list.map(p => (p.id === id ? fn(p) : p))
    );
    this.persist();
  }

  removeProject(id: string): void {
    this._projects.update(list => list.filter(p => p.id !== id));
    this.persist();
  }

  private persist(): void {
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
