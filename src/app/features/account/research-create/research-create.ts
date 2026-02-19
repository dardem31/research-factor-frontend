import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ResearchService} from '../../../core/services/research.service';
import {LinesBoard, LineDraft} from '../../../shared/ui/lines-board/lines-board';
import {Research} from '../../../core/models/research.model';

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
export default class ResearchCreatePage implements OnInit {
  private researchService = inject(ResearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** null = create mode, string = edit mode */
  editingId = signal<string | null>(null);
  isEditMode = computed(() => this.editingId() !== null);

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

  // Step 1 — study protocol
  protocolPrimaryOutcome = '';
  protocolSampleSizeJustification = '';
  protocolStatisticalMethod = '';
  protocolRandomizationMethod = '';
  protocolBlindingDetails = '';
  protocolInterventionDescription = '';
  protocolInclusionCriteria = '';
  protocolExclusionCriteria = '';
  protocolEarlyStoppingCriteria = '';

  // Step 1 — primary outcomes
  primaryOutcomes = signal<string[]>([]);
  newOutcomeText = '';

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

  // ════════════════ Lifecycle ════════════════

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const project = this.researchService.getById(id);
      if (project) {
        this.loadProject(project);
        this.editingId.set(id);
      }
    }
  }

  private loadProject(p: Research) {
    this.title = p.title;
    this.hypothesis = p.hypothesis;
    this.description = p.description;

    // Protocol
    this.protocolPrimaryOutcome = p.protocol.primaryOutcome;
    this.protocolSampleSizeJustification = p.protocol.sampleSizeJustification;
    this.protocolStatisticalMethod = p.protocol.statisticalMethod;
    this.protocolRandomizationMethod = p.protocol.randomizationMethod;
    this.protocolBlindingDetails = p.protocol.blindingDetails;
    this.protocolInterventionDescription = p.protocol.interventionDescription;
    this.protocolInclusionCriteria = p.protocol.inclusionCriteria;
    this.protocolExclusionCriteria = p.protocol.exclusionCriteria;
    this.protocolEarlyStoppingCriteria = p.protocol.earlyStoppingCriteria;

    // Primary outcomes
    this.primaryOutcomes.set(p.primaryOutcomes.map(o => o.text));

    // Tracked parameters
    this.trackedParameters.set(p.trackedParameters.map(t => ({name: t.name, unit: t.unit})));

    // Lines
    this.lines.set(p.lines.map(l => ({
      title: l.title,
      description: l.description,
      duration: l.duration,
      stageQuestions: l.stageQuestions.map(q => q.text),
      tasks: l.tasks.map(t => ({
        title: t.title,
        description: t.description,
        logEntries: t.logEntries,
        artifacts: t.artifacts,
      })),
    })));

    // Subject groups
    this.subjectGroups.set(p.subjectGroups.map(g => ({label: g.label})));
  }

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

  // ════════════════ Primary outcomes ════════════════

  addOutcome() {
    const text = this.newOutcomeText.trim();
    if (!text) return;
    this.primaryOutcomes.update(list => [...list, text]);
    this.newOutcomeText = '';
  }

  removeOutcome(i: number) {
    this.primaryOutcomes.update(list => list.filter((_, idx) => idx !== i));
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

  private buildProtocolInput() {
    return {
      primaryOutcome: this.protocolPrimaryOutcome.trim(),
      sampleSizeJustification: this.protocolSampleSizeJustification.trim(),
      statisticalMethod: this.protocolStatisticalMethod.trim(),
      randomizationMethod: this.protocolRandomizationMethod.trim(),
      blindingDetails: this.protocolBlindingDetails.trim(),
      interventionDescription: this.protocolInterventionDescription.trim(),
      inclusionCriteria: this.protocolInclusionCriteria.trim(),
      exclusionCriteria: this.protocolExclusionCriteria.trim(),
      earlyStoppingCriteria: this.protocolEarlyStoppingCriteria.trim(),
    };
  }

  submit() {
    const id = this.editingId();

    if (id) {
      // ── Edit mode: update existing project ──
      this.researchService.updateResearch(id, {
        title: this.title.trim(),
        hypothesis: this.hypothesis.trim(),
        description: this.description.trim(),
        protocol: this.buildProtocolInput(),
        primaryOutcomes: this.primaryOutcomes(),
        subjectGroups: this.subjectGroups().map(g => g.label),
        trackedParameters: this.trackedParameters(),
      });

      // Reconcile lines: remove old, re-add from drafts
      const existing = this.researchService.getById(id)!;
      for (const line of existing.lines) {
        this.researchService.removeLine(id, line.id);
      }
      for (const lineDraft of this.lines()) {
        const line = this.researchService.addLine(id, {
          title: lineDraft.title,
          description: lineDraft.description,
          duration: lineDraft.duration,
          stageQuestions: lineDraft.stageQuestions,
        });
        for (const taskDraft of lineDraft.tasks) {
          this.researchService.addTask(id, line.id, taskDraft.title);
        }
      }

      this.router.navigate(['/account']);
    } else {
      // ── Create mode ──
      const project = this.researchService.createResearch({
        title: this.title.trim(),
        hypothesis: this.hypothesis.trim(),
        description: this.description.trim(),
        protocol: this.buildProtocolInput(),
        primaryOutcomes: this.primaryOutcomes(),
        subjectGroups: this.subjectGroups().map(g => g.label),
        trackedParameters: this.trackedParameters(),
      });

      for (const lineDraft of this.lines()) {
        const line = this.researchService.addLine(project.id, {
          title: lineDraft.title,
          description: lineDraft.description,
          duration: lineDraft.duration,
          stageQuestions: lineDraft.stageQuestions,
        });
        for (const taskDraft of lineDraft.tasks) {
          this.researchService.addTask(project.id, line.id, taskDraft.title);
        }
      }

      this.router.navigate(['/account']);
    }
  }
}
