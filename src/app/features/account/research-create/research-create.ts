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

interface SubjectDraft {
  code: string;
  remarks: string;
  kycVerified: boolean;
  parameterValues: {parameterId: string; value: number}[];
}

interface GroupDraft {
  label: string;
  description: string;
  subjects: SubjectDraft[];
}

type Step3Modal = 'none' | 'editGroup' | 'editSubject';

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
  newGroupDescription = '';

  // Step 3 — modals
  step3Modal = signal<Step3Modal>('none');
  editingGroupIndex = signal(-1);
  editGroupLabel = '';
  editGroupDescription = '';

  editingSubjectGroupIndex = signal(-1);
  editingSubjectIndex = signal(-1);
  editSubjectCode = '';
  editSubjectRemarks = '';
  editSubjectKycVerified = false;
  editSubjectParams = signal<{parameterId: string; name: string; unit: string; value: number}[]>([]);
  kycCopied = signal(false);

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
    this.subjectGroups.set(p.subjectGroups.map(g => ({
      label: g.label,
      description: g.description,
      subjects: g.subjects.map(s => ({
        code: s.code,
        remarks: s.remarks,
        kycVerified: s.kycVerified,
        parameterValues: s.parameterFields.map(pf => ({parameterId: pf.parameterId, value: pf.currentValue})),
      })),
    })));
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
    this.subjectGroups.update(g => [...g, {label, description: this.newGroupDescription.trim(), subjects: []}]);
    this.newGroupLabel = '';
    this.newGroupDescription = '';
  }

  removeGroup(i: number) {
    this.subjectGroups.update(g => g.filter((_, idx) => idx !== i));
  }

  openEditGroup(i: number) {
    const g = this.subjectGroups()[i];
    this.editingGroupIndex.set(i);
    this.editGroupLabel = g.label;
    this.editGroupDescription = g.description;
    this.step3Modal.set('editGroup');
  }

  saveEditGroup() {
    const i = this.editingGroupIndex();
    this.subjectGroups.update(list =>
      list.map((g, idx) => idx === i
        ? {...g, label: this.editGroupLabel.trim() || g.label, description: this.editGroupDescription}
        : g
      )
    );
    this.closeStep3Modal();
  }

  // ════════════════ Subjects ════════════════

  openAddSubject(groupIndex: number) {
    this.editingSubjectGroupIndex.set(groupIndex);
    this.editingSubjectIndex.set(-1);
    this.editSubjectCode = 'SUB-' + String(this.totalSubjects() + 1).padStart(4, '0');
    this.editSubjectRemarks = '';
    this.editSubjectKycVerified = false;
    this.editSubjectParams.set(
      this.trackedParameters().map(p => ({parameterId: '', name: p.name, unit: p.unit, value: 0}))
    );
    this.step3Modal.set('editSubject');
  }

  openEditSubject(groupIndex: number, subjectIndex: number) {
    const s = this.subjectGroups()[groupIndex].subjects[subjectIndex];
    this.editingSubjectGroupIndex.set(groupIndex);
    this.editingSubjectIndex.set(subjectIndex);
    this.editSubjectCode = s.code;
    this.editSubjectRemarks = s.remarks;
    this.editSubjectKycVerified = s.kycVerified;
    this.editSubjectParams.set(
      this.trackedParameters().map(p => {
        const existing = s.parameterValues.find(pv => pv.parameterId === p.name);
        return {parameterId: p.name, name: p.name, unit: p.unit, value: existing?.value ?? 0};
      })
    );
    this.step3Modal.set('editSubject');
  }

  saveSubject() {
    const gi = this.editingSubjectGroupIndex();
    const si = this.editingSubjectIndex();
    const draft: SubjectDraft = {
      code: this.editSubjectCode.trim(),
      remarks: this.editSubjectRemarks.trim(),
      kycVerified: this.editSubjectKycVerified,
      parameterValues: this.editSubjectParams().map(p => ({parameterId: p.name, value: p.value})),
    };
    this.subjectGroups.update(list =>
      list.map((g, idx) => {
        if (idx !== gi) return g;
        const subjects = [...g.subjects];
        if (si >= 0) {
          subjects[si] = draft;
        } else {
          subjects.push(draft);
        }
        return {...g, subjects};
      })
    );
    this.closeStep3Modal();
  }

  removeSubject(groupIndex: number, subjectIndex: number) {
    this.subjectGroups.update(list =>
      list.map((g, idx) => idx === groupIndex
        ? {...g, subjects: g.subjects.filter((_, j) => j !== subjectIndex)}
        : g
      )
    );
  }

  copyKycLink() {
    const code = this.editSubjectCode.trim();
    const link = `${window.location.origin}/kyc/${code}`;
    navigator.clipboard.writeText(link);
    this.kycCopied.set(true);
    setTimeout(() => this.kycCopied.set(false), 2000);
  }

  totalSubjects = computed(() =>
    this.subjectGroups().reduce((sum, g) => sum + g.subjects.length, 0)
  );

  updateParamValue(index: number, value: number) {
    this.editSubjectParams.update(list =>
      list.map((p, i) => i === index ? {...p, value} : p)
    );
  }

  closeStep3Modal() {
    this.step3Modal.set('none');
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
              subjectGroups: this.subjectGroups().map(g => ({
        label: g.label,
        description: g.description,
        subjects: g.subjects.map(s => ({
          code: s.code, remarks: s.remarks, kycVerified: s.kycVerified,
          parameterValues: s.parameterValues,
        })),
      })),
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
      subjectGroups: this.subjectGroups().map(g => ({
        label: g.label,
        description: g.description,
        subjects: g.subjects.map(s => ({
          code: s.code, remarks: s.remarks, kycVerified: s.kycVerified,
          parameterValues: s.parameterValues,
        })),
      })),
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
