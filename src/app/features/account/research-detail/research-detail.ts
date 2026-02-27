import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ResearchService, ResearchDto, BlindingType} from '../../../core/services/research.service';
import {Research} from '../../../core/models/research/research.model';
import {ResearchLineDto} from '../../../core/dtos/research/research-line.dto';
import {MentionableSubject, MentionableArtifact, TrackedParameterInfo} from '../../../shared/ui/task-modal/task-modal';
import {ParameterField} from '../../../core/models/research/parameter-field.model';
import {GroupDraft} from '../../../core/dtos/research/group-draft.dto';
import {ParamDraft} from '../../../core/dtos/research/param-draft.dto';
import {ResearchLineApiService} from '../../../core/services/research/research-line-api.service';

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
    private lineApiService = inject(ResearchLineApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

editingId = signal<number | null>(null);
    isEditMode = computed(() => this.editingId() !== null);

    tab = signal<TabKey>('project');
    readonly tabs: { key: TabKey; label: string }[] = [
        {key: 'project', label: 'Проект'},
        {key: 'lines', label: 'Research Lines'},
        {key: 'groups', label: 'Группы'},
        {key: 'review', label: 'Обзор'},
    ];

    isSaving = signal(false);

    isTabDisabled(key: TabKey): boolean {
        if (key === 'project') return false;
        return !this.isEditMode();
    }

    // ── Shared state bound to child tabs via model() ──
    title = signal('');
    hypothesis = signal('');
    description = signal('');
    blindingType = signal<BlindingType>('OPEN_LABEL');

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
    lines = signal<ResearchLineDto[]>([]);
    groups = signal<GroupDraft[]>([]);

    /** Full tracked parameter data with IDs, preserved from loaded project */
    private loadedTrackedParameters = signal<TrackedParameterInfo[]>([]);

    /** Subject parameter fields preserved from loaded project, keyed by subject code */
    private loadedSubjectParamFields = signal<Map<string, ParameterField[]>>(new Map());

    /** Cache for mapping IDs during save */
    private _loadedPrimaryOutcomes = signal<{id: number, text: string}[]>([]);
    private _loadedProtocolId = signal<number>(0);

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
            (l.tasks ?? []).flatMap(t =>
                (t.artifacts ?? []).map(a => ({id: a.id, fileName: a.fileName}))
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
            this.editingId.set(Number(id));
            this.loadProjectData(id);
        }
    }

    private loadProjectData(id: string) {
        this.researchService.getResearchById(id).subscribe({
            next: (dto) => {
                this.title.set(dto.title);
                this.hypothesis.set(dto.hypothesis);
                this.description.set(dto.description);
                this.blindingType.set(dto.blindingType);

                if (dto.protocol) {
                    this._loadedProtocolId.set(dto.protocol.id);
                    this.protocolPrimaryOutcome.set(dto.protocol.primaryOutcome || '');
                    this.protocolSampleSizeJustification.set(dto.protocol.sampleSizeJustification || '');
                    this.protocolStatisticalMethod.set(dto.protocol.statisticalMethod || '');
                    this.protocolRandomizationMethod.set(dto.protocol.randomizationMethod || '');
                    this.protocolBlindingDetails.set(dto.protocol.blindingDetails || '');
                    this.protocolInterventionDescription.set(dto.protocol.interventionDescription || '');
                    this.protocolInclusionCriteria.set(dto.protocol.inclusionCriteria || '');
                    this.protocolExclusionCriteria.set(dto.protocol.exclusionCriteria || '');
                    this.protocolEarlyStoppingCriteria.set(dto.protocol.earlyStoppingCriteria || '');
                }

                this.primaryOutcomes.set(dto.primaryOutcomes?.map(o => o.text) ?? []);
                // Cache primary outcomes with IDs if needed for future logic,
                // but for now ensure we can map them back during save
                this._loadedPrimaryOutcomes.set(dto.primaryOutcomes?.map(o => ({
                    id: o.id,
                    text: o.text
                })) ?? []);

                console.log(this.primaryOutcomes)
                this.trackedParameters.set(dto.trackedParameters?.map(p => ({
                    name: p.name,
                    unit: p.unit,
                    referenceMin: p.referenceMin,
                    referenceMax: p.referenceMax
                })) ?? []);

                // Preserve IDs for sub-entities
                if (dto.trackedParameters) {
                    this.loadedTrackedParameters.set(dto.trackedParameters.map(p => ({
                        id: String(p.id),
                        name: p.name,
                        unit: p.unit
                    })));
                }

                // Load research lines
                this.lineApiService.getResearchLinesByResearchId(Number(id)).subscribe(linesDto => {
                    this.lines.set(linesDto.map(ld => ({
                        ...ld,
                        description: ld.description ?? '',
                        stageQuestions: [],
                        tasks: []
                    })));
                });
            }
        });
    }

    // ════════════════ Actions ════════════════

    cancel() {
        this.router.navigate(['/account']);
    }

    saveProject() {
        if (this.isSaving()) return;

        const dto: ResearchDto = {
            id: this.editingId() ?? 0,
            title: this.title(),
            hypothesis: this.hypothesis(),
            description: this.description(),
            blindingType: this.blindingType(),
            protocol: {
                id: this._loadedProtocolId(),
                primaryOutcome: this.protocolPrimaryOutcome(),
                sampleSizeJustification: this.protocolSampleSizeJustification(),
                statisticalMethod: this.protocolStatisticalMethod(),
                randomizationMethod: this.protocolRandomizationMethod(),
                blindingDetails: this.protocolBlindingDetails(),
                interventionDescription: this.protocolInterventionDescription(),
                inclusionCriteria: this.protocolInclusionCriteria(),
                exclusionCriteria: this.protocolExclusionCriteria(),
                earlyStoppingCriteria: this.protocolEarlyStoppingCriteria(),
            },
            primaryOutcomes: this.primaryOutcomes().map(text => {
                const existing = this._loadedPrimaryOutcomes().find(o => o.text === text);
                return {
                    id: existing ? existing.id : 0,
                    text
                };
            }),
            trackedParameters: this.trackedParameters().map(p => {
                const existing = this.loadedTrackedParameters().find(lp => lp.name === p.name);
                return {
                    id: existing ? Number(existing.id) : 0,
                    name: p.name,
                    unit: p.unit,
                    referenceMin: p.referenceMin,
                    referenceMax: p.referenceMax
                };
            }),
        };

        this.isSaving.set(true);

        if (this.editingId()) {
            this.researchService.api.updateResearch(dto).subscribe({
                next: () => {
                    this.isSaving.set(false);
                    // Refresh data to get any new IDs from server
                    this.loadProjectData(String(this.editingId()!));
                },
                error: () => this.isSaving.set(false)
            });
        } else {
            this.researchService.saveNewResearch(dto).subscribe({
                next: (res) => {
                    this.editingId.set(Number(res.id));
                    this.isSaving.set(false);
                    this.router.navigate(['/account/research', res.id], {replaceUrl: true});
                },
                error: () => this.isSaving.set(false)
            });
}
    }

    onProjectSaved(id: string) {
        this.editingId.set(Number(id));
        // Move to next tab or stay on project? User didn't specify, but usually staying is safer.
        // However, the instructions say "включаем остальные табы и можем позволить юзеру продолжить работу"
    }
}
