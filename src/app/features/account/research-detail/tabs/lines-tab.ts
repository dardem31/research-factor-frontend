import {Component, input, model} from '@angular/core';
import {LinesBoard} from '../../../../shared/ui/lines-board/lines-board';
import {ResearchLineDto} from '../../../../core/dtos/research/research-line.dto';
import {MentionableSubject, MentionableArtifact, TrackedParameterInfo} from '../../../../shared/ui/task-modal/task-modal';

@Component({
  standalone: true,
  selector: 'rf-lines-tab',
  template: `
    <rf-lines-board
      [researchId]="researchId()"
      [lines]="lines()"
      (linesChange)="lines.set($event)"
      [subjects]="subjects()"
      [mentionableArtifacts]="mentionableArtifacts()"
      [trackedParameters]="trackedParameters()"
      [readonly]="readonly()"
    />
  `,
  imports: [LinesBoard],
})
export class LinesTab {
  researchId = input.required<number>();
  lines = model.required<ResearchLineDto[]>();
  subjects = input<MentionableSubject[]>([]);
  mentionableArtifacts = input<MentionableArtifact[]>([]);
  trackedParameters = input<TrackedParameterInfo[]>([]);
  readonly = input(false);
}
