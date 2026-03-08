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
import {ResearchPublicApiService} from '../../../core/services/research/research-public-api.service';
import {AuthService} from '../../../core/auth/auth.service';

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
    private publicApiService = inject(ResearchPublicApiService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    /** When true, the page is in public showcase mode (readonly, public API) */
    publicMode = signal(false);

editingId = signal<number | null>(null);
    isEditMode = computed(() => this.editingId() !== null);

    /** userId of the research owner (loaded from backend) */
    private researchOwnerId = signal<number | null>(null);

    /** supervisorId of the research (loaded from backend) */
    private supervisorId = signal<number | null>(null);

    /** current status of the research */
    private status = signal<string | null>(null);

    /** true when the current user owns this research (or it's a new research) */
    isOwner = computed(() => {
        if (this.publicMode()) return false;
        const ownerId = this.researchOwnerId();
        const currentUser = this.authService.user();
        // New research — user is creating it, so they are the owner
        if (!this.isEditMode()) return true;
        // Not yet loaded
        if (ownerId === null || !currentUser) return false;
        return currentUser.id === ownerId;
    });

    /** true when the current user can manage supervisor status (ADMIN or RESEARCH_SUPERVISOR) */
    canManageSupervisor = computed(() => this.authService.canReview());

    /** true when the "Set Supervisor" button should be shown */
    showSetSupervisor = computed(() => {
        if (this.publicMode()) return false;
        return this.isEditMode() && this.canManageSupervisor() && !this.supervisorId();
    });

    /** true when the "Publish" button should be shown */
    showPublish = computed(() => {
        if (this.publicMode()) return false;
        const currentUser = this.authService.user();
        return this.isEditMode() &&
               this.status() === 'PENDING_REVIEW' &&
               this.supervisorId() !== null &&
               currentUser !== null &&
               this.supervisorId() === currentUser.id;
    });

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
    private _loadedPrimaryOutcomes = signal<{id: number | null, text: string}[]>([]);
    private _loadedProtocolId = signal<number | null>(0);

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
        const isPublic = this.route.snapshot.data['publicMode'] === true;
        this.publicMode.set(isPublic);

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId.set(Number(id));
            if (isPublic) {
                this.loadPublicProjectData(id);
            } else {
                this.loadProjectData(id);
            }
        }
    }

    private loadProjectData(id: string) {
        this.researchService.getResearchById(id).subscribe({
            next: (dto) => this.applyDto(dto, id)
        });
    }

    private loadPublicProjectData(id: string) {
        this.publicApiService.getResearchById(id).subscribe({
            next: (dto) => this.applyDto(dto, id)
        });
    }

    private applyDto(dto: ResearchDto, id: string) {
        this.researchOwnerId.set(dto.userId ?? null);
        this.supervisorId.set(dto.supervisorId ?? null);
        this.status.set(dto.status ?? null);
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
        this._loadedPrimaryOutcomes.set(dto.primaryOutcomes?.map(o => ({
            id: o.id,
            text: o.text
        })) ?? []);

        this.trackedParameters.set(dto.trackedParameters?.map(p => ({
            name: p.name,
            unit: p.unit,
            referenceMin: p.referenceMin,
            referenceMax: p.referenceMax
        })) ?? []);

        if (dto.trackedParameters) {
            this.loadedTrackedParameters.set(dto.trackedParameters.map(p => ({
                id: String(p.id),
                name: p.name,
                unit: p.unit
            })));
        }

        // Load research lines (only for authenticated / dashboard mode)
        if (!this.publicMode()) {
            this.lineApiService.getResearchLinesByResearchId(Number(id)).subscribe(linesDto => {
                this.lines.set(linesDto.map(ld => ({
                    ...ld,
                    description: ld.description ?? '',
                    stageQuestions: [],
                    tasks: []
                })));
            });
        }
    }

    // ════════════════ Actions ════════════════

    cancel() {
        if (this.publicMode()) {
            this.router.navigate(['/showcase']);
        } else {
            this.router.navigate(['/account']);
        }
    }

    setSupervisor() {
        const id = this.editingId();
        if (!id) return;
        this.researchService.setSupervisor(String(id)).subscribe({
            next: () => this.loadProjectData(String(id))
        });
    }

    publish() {
        const id = this.editingId();
        if (!id) return;
        this.researchService.publish(String(id)).subscribe({
            next: () => this.loadProjectData(String(id))
        });
    }

    saveProject() {
        if (this.isSaving()) return;

        const dto: ResearchDto = {
            id: this.editingId() ?? null,
            title: this.title(),
            status: "DRAFT",
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
                    id: existing ? existing.id : null,
                    text
                };
            }),
            trackedParameters: this.trackedParameters().map(p => {
                const existing = this.loadedTrackedParameters().find(lp => lp.name === p.name);
                return {
                    id: existing ? Number(existing.id) : null,
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
