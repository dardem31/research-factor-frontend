import { Injectable, inject } from '@angular/core';
import { ResearchStateService } from './research-state.service';
import { ResearchLine } from '../../models/research/research-line.model';
import { ResearchTask } from '../../models/research/research-task.model';
import { AddLineInput } from '../../dtos/research/research-inputs.dto';

/**
 * Service for managing Research Lines (phases)
 */
@Injectable({ providedIn: 'root' })
export class ResearchLinesService {
  private state = inject(ResearchStateService);

  addLine(projectId: string, input: AddLineInput): ResearchLine {
    const project = this.state.getById(projectId);
    const line: ResearchLine = {
      id: crypto.randomUUID(),
      sequenceOrder: (project?.lines.length ?? 0) + 1,
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

    this.state.updateProject(projectId, p => ({
      ...p,
      lines: [...p.lines, line],
    }));

    return line;
  }

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
