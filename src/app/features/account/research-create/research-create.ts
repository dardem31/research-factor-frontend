import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ResearchService} from '../../../core/services/research.service';
import {LinesBoard, LineDraft} from '../../../shared/ui/lines-board/lines-board';

@Component({
  standalone: true,
  templateUrl: './research-create.html',
  imports: [FormsModule, LinesBoard],
})
export default class ResearchCreatePage {
  private researchService = inject(ResearchService);
  private router = inject(Router);

  /** Wizard step: 1=project info, 2=board, 3=review */
  step = signal(1);

  // Step 1
  title = '';
  description = '';

  // Step 2 — board data (two-way bound with <rf-lines-board>)
  lines = signal<LineDraft[]>([]);

  // ════════════════ Navigation ════════════════

  nextToBoard() {
    if (!this.title.trim()) return;
    this.step.set(2);
  }

  nextToReview() {
    if (this.lines().length === 0) return;
    this.step.set(3);
  }

  back() {
    this.step.update(s => Math.max(1, s - 1));
  }

  // ════════════════ Submit ════════════════

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

      for (const taskDraft of lineDraft.tasks) {
        this.researchService.addTask(project.id, line.id, taskDraft.title);
      }
    }

    this.router.navigate(['/account', project.id]);
  }
}
