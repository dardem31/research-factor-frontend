import {inject, Injectable} from '@angular/core';
import {ResearchStateService} from './research-state.service';
import {ResearchTask} from '../../models/research/research-task.model';

/**
 * Service for managing Research Lines (phases)
 */
@Injectable({ providedIn: 'root' })
export class ResearchLinesService {
  private state = inject(ResearchStateService);

  removeLine(projectId: string, lineId: string): void {
    this.state.updateProject(projectId, p => ({
      ...p,
      lines: p.lines
        .filter(l => l.id !== lineId)
        .map((l, i) => ({ ...l, sequenceOrder: i + 1 })),
    }));
  }

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

    this.state.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId ? { ...l, tasks: [...l.tasks, task] } : l
      ),
    }));

    return task;
  }

  removeTask(projectId: string, lineId: string, taskId: string): void {
    this.state.updateProject(projectId, p => ({
      ...p,
      lines: p.lines.map(l =>
        l.id === lineId
          ? { ...l, tasks: l.tasks.filter(t => t.id !== taskId) }
          : l
      ),
    }));
  }
}
