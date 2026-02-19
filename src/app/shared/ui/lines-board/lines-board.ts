import {Component, input, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TaskModal} from '../task-modal/task-modal';
import {LogEntry, Artifact} from '../../../core/models/research.model';

export interface TaskDraft {
  title: string;
  description: string;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}

export interface LineDraft {
  title: string;
  description: string;
  duration: string;
  stageQuestions: string[];
  tasks: TaskDraft[];
}

type ModalType = 'none' | 'editLine' | 'stageQuestions' | 'editTask';

@Component({
  standalone: true,
  selector: 'rf-lines-board',
  templateUrl: './lines-board.html',
  imports: [FormsModule, TaskModal],
})
export class LinesBoard {
  /** Two-way bound lines data — parent owns the source of truth */
  lines = model.required<LineDraft[]>();

  /** When true, the board and all modals are read-only */
  readonly = input(false);

  // ── Modal state ──
  modal = signal<ModalType>('none');
  activeLineIndex = signal(-1);
  activeTaskIndex = signal(-1);

  // Temp form fields
  editLineTitle = '';
  editLineDescription = '';
  editLineDuration = '';
  newQuestionText = '';
  newTaskTitle = '';

  // ════════════════ Lines (columns) ════════════════

  addLine() {
    this.lines.update(list => [
      ...list,
      {title: 'Research Line ' + (list.length + 1), description: '', duration: '', stageQuestions: [], tasks: []},
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
    this.editLineDuration = line.duration;
    this.modal.set('editLine');
  }

  saveEditLine() {
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i
          ? {...l, title: this.editLineTitle.trim() || l.title, description: this.editLineDescription, duration: this.editLineDuration}
          : l
      )
    );
    this.closeModal();
  }

  // ════════════════ Modal: Stage Questions ════════════════

  openStageQuestions(lineIndex: number) {
    this.activeLineIndex.set(lineIndex);
    this.newQuestionText = '';
    this.modal.set('stageQuestions');
  }

  addStageQuestion() {
    const text = this.newQuestionText.trim();
    if (!text) return;
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i ? {...l, stageQuestions: [...l.stageQuestions, text]} : l
      )
    );
    this.newQuestionText = '';
  }

  removeStageQuestion(qIndex: number) {
    const i = this.activeLineIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === i ? {...l, stageQuestions: l.stageQuestions.filter((_, j) => j !== qIndex)} : l
      )
    );
  }

  // ════════════════ Tasks ════════════════

  addTask(lineIndex: number) {
    if (this.readonly()) return;
    const text = this.newTaskTitle.trim();
    if (!text) return;
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === lineIndex
          ? {...l, tasks: [...l.tasks, {title: text, description: '', logEntries: [], artifacts: []}]}
          : l
      )
    );
    this.newTaskTitle = '';
  }

  removeTask(lineIndex: number, taskIndex: number) {
    if (this.readonly()) return;
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === lineIndex ? {...l, tasks: l.tasks.filter((_, j) => j !== taskIndex)} : l
      )
    );
    this.closeModal();
  }

  // ════════════════ Modal: Edit Task ════════════════

  openEditTask(lineIndex: number, taskIndex: number) {
    this.activeLineIndex.set(lineIndex);
    this.activeTaskIndex.set(taskIndex);
    this.modal.set('editTask');
  }

  activeTask(): TaskDraft | null {
    const li = this.activeLineIndex();
    const ti = this.activeTaskIndex();
    if (li < 0 || ti < 0) return null;
    return this.lines()[li]?.tasks[ti] ?? null;
  }

  onTaskSave(updated: TaskDraft) {
    const li = this.activeLineIndex();
    const ti = this.activeTaskIndex();
    this.lines.update(list =>
      list.map((l, idx) =>
        idx === li
          ? {...l, tasks: l.tasks.map((t, j) => (j === ti ? updated : t))}
          : l
      )
    );
    this.closeModal();
  }

  onTaskDelete() {
    this.removeTask(this.activeLineIndex(), this.activeTaskIndex());
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
