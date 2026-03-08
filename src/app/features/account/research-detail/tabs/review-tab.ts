import {Component, computed, input} from '@angular/core';
import {ResearchLineDto} from '../../../../core/dtos/research/research-line.dto';
import {ParamDraft} from '../../../../core/dtos/research/param-draft.dto';
import {SubjectGroup} from "../../../../core/dtos/subject/subject-group.dto";

@Component({
  standalone: true,
  selector: 'rf-review-tab',
  templateUrl: './review-tab.html',
})
export class ReviewTab {
  title = input('');
  hypothesis = input('');
  description = input('');

  protocolPrimaryOutcome = input('');
  protocolSampleSizeJustification = input('');
  protocolStatisticalMethod = input('');
  protocolRandomizationMethod = input('');
  protocolBlindingDetails = input('');
  protocolInterventionDescription = input('');
  protocolInclusionCriteria = input('');
  protocolExclusionCriteria = input('');
  protocolEarlyStoppingCriteria = input('');

  primaryOutcomes = input<string[]>([]);
  trackedParameters = input<ParamDraft[]>([]);
  lines = input<ResearchLineDto[]>([]);
  groups = input<SubjectGroup[]>([]);
  isEditMode = input(false);

  totalStageQuestions = computed(() =>
    this.lines().reduce((sum, l) => sum + (l.stageQuestions ?? []).length, 0)
  );
  totalTasks = computed(() =>
    this.lines().reduce((sum, l) => sum + (l.tasks ?? []).length, 0)
  );
  totalSubjects = computed(() =>
    this.groups().reduce((sum, g) => sum + g.subjects.length, 0)
  );
}
