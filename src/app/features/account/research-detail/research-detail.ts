import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ResearchService} from '../../../core/services/research.service';
import {Research} from '../../../core/models/research.model';
import {LineDraft} from '../../../shared/ui/lines-board/lines-board';
import {MentionableSubject, MentionableArtifact, TrackedParameterInfo} from '../../../shared/ui/task-modal/task-modal';
import {ParameterField} from '../../../core/models/research.model';
import {GroupDraft, ParamDraft} from './research-detail.types';

import {ProjectTab} from './tabs/project-tab';
import {LinesTab} from './tabs/lines-tab';
import {GroupsTab} from './tabs/groups-tab';
import {ReviewTab} from './tabs/review-tab';

type TabKey = 'project' | 'lines' | 'groups' | 'review';

@Component({
  standalone: true,
  selector: 'rf-research-detail',
  templateUrl: './research-detail.html',
  imports: [ProjectTab, LinesTab, GroupsTab, ReviewTab],
})
export default class ResearchDetailPage implements OnInit {
  private researchService = inject(ResearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editingId = signal<string | null>(null);
  isEditMode = computed(() => this.editingId() !== null);

  tab = signal<TabKey>('project');
  readonly tabs: {key: TabKey; label: string}[] = [
    {key: 'project', label: 'Проект'},
    {key: 'lines', label: 'Research Lines'},
    {key: 'groups', label: 'Группы'},
    {key: 'review', label: 'Обзор'},
  ];

  // ── Shared state bound to child tabs via model() ──
  title = signal('');
  hypothesis = signal('');
  description = signal('');

  protocolPrimaryOutcome = signal('');
  protocolSampleSizeJustification = signal('');
  protocolStatisticalMethod = signal('');
  protocolRandomizationMethod = signal('');
  protocolBlindingDetails = signal('');
  protocolInterventionDescription = signal('');
  protocolInclusionCriteria = signal('');
  protocolExclusionCriteria = signal('');
  protocolEarlyStoppingCriteria = signal('');

  primaryOutcomes = signal<string[]>([]);
  trackedParameters = signal<ParamDraft[]>([]);
  lines = signal<LineDraft[]>([]);
  groups = signal<GroupDraft[]>([]);

  /** Full tracked parameter data with IDs, preserved from loaded project */
  private loadedTrackedParameters = signal<TrackedParameterInfo[]>([]);

  /** Subject parameter fields preserved from loaded project, keyed by subject code */
  private loadedSubjectParamFields = signal<Map<string, ParameterField[]>>(new Map());

  // ── Computed mention sources (derived from groups + task artifacts) ──
  mentionableSubjects = computed<MentionableSubject[]>(() => {
    const paramFieldsMap = this.loadedSubjectParamFields();
    return this.groups().flatMap(g =>
      g.subjects.map(s => ({
        id: s.code,
        code: s.code,
        parameterFields: paramFieldsMap.get(s.code) ?? s.parameterValues.map(pv => ({
          id: crypto.randomUUID(),
          parameterId: pv.parameterId,
          currentValue: pv.value,
          updatedAt: new Date().toISOString(),
        })),
      }))
    );
  });

  mentionableArtifacts = computed<MentionableArtifact[]>(() =>
    this.lines().flatMap(l =>
      l.tasks.flatMap(t =>
        t.artifacts.map(a => ({id: a.id, fileName: a.fileName}))
      )
    )
  );

  /** TrackedParameterInfo for the task modal (with IDs) */
  trackedParameterInfos = computed<TrackedParameterInfo[]>(() => {
    const loaded = this.loadedTrackedParameters();
    if (loaded.length > 0) return loaded;
    // Fallback: generate temp IDs from ParamDraft
    return this.trackedParameters().map((p, i) => ({
      id: `temp-param-${i}`,
      name: p.name,
      unit: p.unit,
    }));
  });

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
    this.title.set(p.title);
    this.hypothesis.set(p.hypothesis);
    this.description.set(p.description);

    this.protocolPrimaryOutcome.set(p.protocol.primaryOutcome);
    this.protocolSampleSizeJustification.set(p.protocol.sampleSizeJustification);
    this.protocolStatisticalMethod.set(p.protocol.statisticalMethod);
    this.protocolRandomizationMethod.set(p.protocol.randomizationMethod);
    this.protocolBlindingDetails.set(p.protocol.blindingDetails);
    this.protocolInterventionDescription.set(p.protocol.interventionDescription);
    this.protocolInclusionCriteria.set(p.protocol.inclusionCriteria);
    this.protocolExclusionCriteria.set(p.protocol.exclusionCriteria);
    this.protocolEarlyStoppingCriteria.set(p.protocol.earlyStoppingCriteria);

    this.primaryOutcomes.set(p.primaryOutcomes.map(o => o.text));
    this.trackedParameters.set(p.trackedParameters.map(t => ({name: t.name, unit: t.unit})));
    this.loadedTrackedParameters.set(p.trackedParameters.map(t => ({id: t.id, name: t.name, unit: t.unit})));

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

    this.groups.set(p.subjectGroups.map(g => ({
      label: g.label,
      description: g.description,
      subjects: g.subjects.map(s => ({
        code: s.code,
        remarks: s.remarks,
        kycVerified: s.kycVerified,
        parameterValues: s.parameterFields.map(pf => ({parameterId: pf.parameterId, value: pf.currentValue})),
      })),
    })));

    // Preserve full parameterFields for subject update panels
    const paramFieldsMap = new Map<string, ParameterField[]>();
    p.subjectGroups.forEach(g =>
      g.subjects.forEach(s => paramFieldsMap.set(s.code, [...s.parameterFields]))
    );
    this.loadedSubjectParamFields.set(paramFieldsMap);
  }

  // ════════════════ Actions ════════════════

  cancel() {
    this.router.navigate(['/account']);
  }

  submit() {
    const protocol = {
      primaryOutcome: this.protocolPrimaryOutcome(),
      sampleSizeJustification: this.protocolSampleSizeJustification(),
      statisticalMethod: this.protocolStatisticalMethod(),
      randomizationMethod: this.protocolRandomizationMethod(),
      blindingDetails: this.protocolBlindingDetails(),
      interventionDescription: this.protocolInterventionDescription(),
      inclusionCriteria: this.protocolInclusionCriteria(),
      exclusionCriteria: this.protocolExclusionCriteria(),
      earlyStoppingCriteria: this.protocolEarlyStoppingCriteria(),
    };

    const groupsInput = this.groups().map(g => ({
      label: g.label,
      description: g.description,
      subjects: g.subjects.map(s => ({
        code: s.code, remarks: s.remarks, kycVerified: s.kycVerified,
        parameterValues: s.parameterValues,
      })),
    }));

    const id = this.editingId();

    if (id) {
      this.researchService.updateResearch(id, {
        title: this.title(), hypothesis: this.hypothesis(), description: this.description(),
        protocol, primaryOutcomes: this.primaryOutcomes(),
        subjectGroups: groupsInput, trackedParameters: this.trackedParameters(),
      });

      // Reconcile lines
      const existing = this.researchService.getById(id)!;
      for (const line of existing.lines) this.researchService.removeLine(id, line.id);
      for (const ld of this.lines()) {
        const line = this.researchService.addLine(id, {title: ld.title, description: ld.description, duration: ld.duration, stageQuestions: ld.stageQuestions});
        for (const td of ld.tasks) this.researchService.addTask(id, line.id, td.title);
      }
    } else {
      const project = this.researchService.createResearch({
        title: this.title(), hypothesis: this.hypothesis(), description: this.description(),
        protocol, primaryOutcomes: this.primaryOutcomes(),
        subjectGroups: groupsInput, trackedParameters: this.trackedParameters(),
      });

      for (const ld of this.lines()) {
        const line = this.researchService.addLine(project.id, {title: ld.title, description: ld.description, duration: ld.duration, stageQuestions: ld.stageQuestions});
        for (const td of ld.tasks) this.researchService.addTask(project.id, line.id, td.title);
      }
    }

    this.router.navigate(['/account']);
  }
}
