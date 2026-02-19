import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ResearchService} from '../../../core/services/research.service';
import {LinesBoard, LineDraft} from '../../../shared/ui/lines-board/lines-board';

interface ParamDraft {
  name: string;
  unit: string;
}

interface GroupDraft {
  label: string;
}

@Component({
  standalone: true,
  templateUrl: './research-create.html',
  imports: [FormsModule, LinesBoard],
})
export default class ResearchCreatePage {
  private researchService = inject(ResearchService);
  private router = inject(Router);

  /** Wizard steps: 1=project info, 2=research lines, 3=subject groups (optional), 4=review */
  step = signal(1);

  readonly steps = [
    {n: 1, label: 'Проект'},
    {n: 2, label: 'Research Lines'},
    {n: 3, label: 'Группы'},
    {n: 4, label: 'Обзор'},
  ];

  // Step 1 — project info
  title = '';
  hypothesis = '';
  description = '';

  // Step 1 — tracked parameters
  trackedParameters = signal<ParamDraft[]>([]);
  newParamName = '';
  newParamUnit = '';

  // Step 2 — board data
  lines = signal<LineDraft[]>([]);

  // Step 3 — subject groups (optional)
  subjectGroups = signal<GroupDraft[]>([]);
  newGroupLabel = '';

  // Computed progress
  totalStageQuestions = computed(() =>
    this.lines().reduce((sum, l) => sum + l.stageQuestions.length, 0)
  );
  totalTasks = computed(() =>
    this.lines().reduce((sum, l) => sum + l.tasks.length, 0)
  );

  // ════════════════ Navigation ════════════════

  nextToBoard() {
    if (!this.title.trim() || !this.hypothesis.trim()) return;
    this.step.set(2);
  }

  nextToGroups() {
    if (this.lines().length === 0) return;
    this.step.set(3);
  }

  nextToReview() {
    this.step.set(4);
  }

  back() {
    this.step.update(s => Math.max(1, s - 1));
  }

  goToStep(n: number) {
    // Only allow navigating to already-visited or current steps
    if (n < this.step()) {
      this.step.set(n);
    }
  }

  // ════════════════ Subject groups ════════════════

  addGroup() {
    const label = this.newGroupLabel.trim();
    if (!label) return;
    this.subjectGroups.update(g => [...g, {label}]);
    this.newGroupLabel = '';
  }

  removeGroup(i: number) {
    this.subjectGroups.update(g => g.filter((_, idx) => idx !== i));
  }

  // ════════════════ Tracked parameters ════════════════

  addParam() {
    const name = this.newParamName.trim();
    const unit = this.newParamUnit.trim();
    if (!name || !unit) return;
    this.trackedParameters.update(p => [...p, {name, unit}]);
    this.newParamName = '';
    this.newParamUnit = '';
  }

  removeParam(i: number) {
    this.trackedParameters.update(p => p.filter((_, idx) => idx !== i));
  }

  // ════════════════ Submit ════════════════

  submit() {
    const project = this.researchService.createResearch({
      title: this.title.trim(),
      hypothesis: this.hypothesis.trim(),
      description: this.description.trim(),
      subjectGroups: this.subjectGroups().map(g => g.label),
      trackedParameters: this.trackedParameters(),
    });

    for (const lineDraft of this.lines()) {
      const line = this.researchService.addLine(project.id, {
        title: lineDraft.title,
        description: lineDraft.description,
        stageQuestions: lineDraft.stageQuestions,
      });

      for (const taskDraft of lineDraft.tasks) {
        this.researchService.addTask(project.id, line.id, taskDraft.title);
      }
    }

    this.router.navigate(['/account', project.id]);
  }
}
