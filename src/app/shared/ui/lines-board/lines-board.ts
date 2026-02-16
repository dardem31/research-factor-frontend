import {Component, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

export interface TaskDraft {
  title: string;
  description: string;
}

export interface LineDraft {
  title: string;
  description: string;
  objectives: string[];
  tasks: TaskDraft[];
}

type ModalType = 'none' | 'editLine' | 'objectives' | 'editTask';

@Component({
  standalone: true,
  selector: 'rf-lines-board',
  templateUrl: './lines-board.html',
  imports: [FormsModule],
})
export class LinesBoard {
  /** Two-way bound lines data — parent owns the source of truth */
  lines = model.required<LineDraft[]>();

  // ── Modal state ──
  modal = signal<ModalType>('none');
  activeLineIndex = signal(-1);
  activeTaskIndex = signal(-1);

  // Temp form fields
  editLineTitle = '';
  editLineDescription = '';
  newObjectiveText = '';
  editTaskTitle = '';
  editTaskDescription = '';
  newTaskTitle = '';

  // ════════════════ Lines (columns) ════════════════

  addLine() {
    this.lines.update(list => [
      ...list,
      {title: 'Research Line ' + (list.length + 1), description: '', objectives: [], tasks: []},
    ]);
    this.openEditLine(this.lines().length - 1);
  }

  removeLine(index: number) {
    this.lines.update(list => list.filter((_, i) => i !== index));
    this.closeModal();
  }

  // ════════════════ Modal: Edit Line ════════════════

  openEditLine(lineIndex: number) {
    const line = this.lines()[lineIndex];
    this.activeLineIndex.set(lineIndex);
    this.editLineTitle = line.title;
    this.editLineDescription = line.description;
    this.modal.set('editLine');
  }

  saveEditLine() {
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i
          ? {...l, title: this.editLineTitle.trim() || l.title, description: this.editLineDescription}
          : l
      )
    );
    this.closeModal();
  }

  // ════════════════ Modal: Objectives ════════════════

  openObjectives(lineIndex: number) {
    this.activeLineIndex.set(lineIndex);
    this.newObjectiveText = '';
    this.modal.set('objectives');
  }

  addObjective() {
    const text = this.newObjectiveText.trim();
    if (!text) return;
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i ? {...l, objectives: [...l.objectives, text]} : l
      )
    );
    this.newObjectiveText = '';
  }

  removeObjective(objIndex: number) {
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i ? {...l, objectives: l.objectives.filter((_, j) => j !== objIndex)} : l
      )
    );
  }

  // ════════════════ Tasks ════════════════

  addTask(lineIndex: number) {
    const text = this.newTaskTitle.trim();
    if (!text) return;
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === lineIndex ? {...l, tasks: [...l.tasks, {title: text, description: ''}]} : l
      )
    );
    this.newTaskTitle = '';
  }

  removeTask(lineIndex: number, taskIndex: number) {
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === lineIndex ? {...l, tasks: l.tasks.filter((_, j) => j !== taskIndex)} : l
      )
    );
    this.closeModal();
  }

  // ════════════════ Modal: Edit Task ════════════════

  openEditTask(lineIndex: number, taskIndex: number) {
    const task = this.lines()[lineIndex].tasks[taskIndex];
    this.activeLineIndex.set(lineIndex);
    this.activeTaskIndex.set(taskIndex);
    this.editTaskTitle = task.title;
    this.editTaskDescription = task.description;
    this.modal.set('editTask');
  }

  saveEditTask() {
    const li = this.activeLineIndex();
    const ti = this.activeTaskIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === li
          ? {
              ...l,
              tasks: l.tasks.map((t, j) =>
                j === ti
                  ? {title: this.editTaskTitle.trim() || t.title, description: this.editTaskDescription}
                  : t
              ),
            }
          : l
      )
    );
    this.closeModal();
  }

  // ════════════════ Helpers ════════════════

  closeModal() {
    this.modal.set('none');
  }

  activeLine(): LineDraft | null {
    const i = this.activeLineIndex();
    return i >= 0 ? this.lines()[i] ?? null : null;
  }
}
