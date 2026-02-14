import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ResearchService} from '../../../core/services/research.service';
import {Research} from '../../../core/models/research.model';

interface LineDraft {
  title: string;
  objectives: string[];
  steps: string[];
}

@Component({
  standalone: true,
  templateUrl: './research-create.html',
  imports: [FormsModule],
})
export default class ResearchCreatePage {
  private researchService = inject(ResearchService);
  private router = inject(Router);

  /** Wizard step: 1=project info, 2=lines, 3=review */
  step = signal(1);

  // Step 1: Project info
  title = '';
  description = '';

  // Step 2: Lines
  lines = signal<LineDraft[]>([]);

  // Temp inputs
  newLineTitle = '';
  newObjective: Record<number, string> = {};
  newStep: Record<number, string> = {};

  /** Step 1 → Step 2 */
  nextToLines() {
    if (!this.title.trim()) return;
    this.step.set(2);
  }

  /** Step 2 → Step 3 */
  nextToReview() {
    if (this.lines().length === 0) return;
    this.step.set(3);
  }

  back() {
    this.step.update(s => Math.max(1, s - 1));
  }

  // --- Lines management ---

  addLine() {
    if (!this.newLineTitle.trim()) return;
    this.lines.update(list => [
      ...list,
      {title: this.newLineTitle.trim(), objectives: [], steps: []},
    ]);
    this.newLineTitle = '';
  }

  removeLine(index: number) {
    this.lines.update(list => list.filter((_, i) => i !== index));
  }

  // --- Objectives ---

  addObjective(lineIndex: number) {
    const text = (this.newObjective[lineIndex] ?? '').trim();
    if (!text) return;
    this.lines.update(list =>
      list.map((l, i) =>
        i === lineIndex ? {...l, objectives: [...l.objectives, text]} : l
      )
    );
    this.newObjective[lineIndex] = '';
  }

  removeObjective(lineIndex: number, objIndex: number) {
    this.lines.update(list =>
      list.map((l, i) =>
        i === lineIndex
          ? {...l, objectives: l.objectives.filter((_, j) => j !== objIndex)}
          : l
      )
    );
  }

  // --- Steps ---

  addStep(lineIndex: number) {
    const text = (this.newStep[lineIndex] ?? '').trim();
    if (!text) return;
    this.lines.update(list =>
      list.map((l, i) =>
        i === lineIndex ? {...l, steps: [...l.steps, text]} : l
      )
    );
    this.newStep[lineIndex] = '';
  }

  removeStep(lineIndex: number, stepIndex: number) {
    this.lines.update(list =>
      list.map((l, i) =>
        i === lineIndex
          ? {...l, steps: l.steps.filter((_, j) => j !== stepIndex)}
          : l
      )
    );
  }

  // --- Submit ---

  submit() {
    const project = this.researchService.createResearch(
      this.title.trim(),
      this.description.trim()
    );

    for (const lineDraft of this.lines()) {
      const line = this.researchService.addLine(
        project.id,
        lineDraft.title,
        lineDraft.objectives
      );

      for (const stepTitle of lineDraft.steps) {
        this.researchService.addStep(project.id, line.id, stepTitle);
      }
    }

    this.router.navigate(['/account', project.id]);
  }
}
