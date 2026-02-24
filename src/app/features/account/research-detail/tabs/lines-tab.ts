import {Component, input, model} from '@angular/core';
import {LinesBoard, LineDraft} from '../../../../shared/ui/lines-board/lines-board';
import {MentionableSubject, MentionableArtifact, TrackedParameterInfo} from '../../../../shared/ui/task-modal/task-modal';

@Component({
  standalone: true,
  selector: 'rf-lines-tab',
  template: '<rf-lines-board [lines]="lines()" (linesChange)="lines.set($event)" [subjects]="subjects()" [mentionableArtifacts]="mentionableArtifacts()" [trackedParameters]="trackedParameters()" />',
  imports: [LinesBoard],
})
export class LinesTab {
  lines = model.required<LineDraft[]>();
  subjects = input<MentionableSubject[]>([]);
  mentionableArtifacts = input<MentionableArtifact[]>([]);
  trackedParameters = input<TrackedParameterInfo[]>([]);
}
