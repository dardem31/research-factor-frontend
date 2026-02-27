import {Component, inject, input, model, signal, effect} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TaskModal, MentionableSubject, MentionableArtifact, TrackedParameterInfo} from '../task-modal/task-modal';
import {ResearchLineApiService} from '../../../core/services/research/research-line-api.service';
import {ResearchLineDto} from '../../../core/dtos/research/research-line.dto';
import {StageQuestionApiService} from '../../../core/services/research/stage-question-api.service';
import {StageQuestionDto} from '../../../core/dtos/research/stage-question.dto';
import {ResearchTaskApiService} from '../../../core/services/research/research-task-api.service';
import {ResearchTaskDto} from '../../../core/dtos/research/research-task.dto';

type ModalType = 'none' | 'editLine' | 'stageQuestions' | 'editTask';

@Component({
    standalone: true,
    selector: 'rf-lines-board',
    templateUrl: './lines-board.html',
    imports: [FormsModule, TaskModal],
})
export class LinesBoard {
    private lineApiService = inject(ResearchLineApiService);
    private stageQuestionApiService = inject(StageQuestionApiService);
    private taskApiService = inject(ResearchTaskApiService);

    /** Two-way bound lines data — parent owns the source of truth */
    lines = model.required<ResearchLineDto[]>();

    researchId = input.required<number>();

    /** When true, the board and all modals are read-only */
    readonly = input(false);

    /** Subjects available for @mention in logs */
    subjects = input<MentionableSubject[]>([]);

    /** Artifacts available for @mention in logs */
    mentionableArtifacts = input<MentionableArtifact[]>([]);

    /** Tracked parameters for subject update panel */
    trackedParameters = input<TrackedParameterInfo[]>([]);

    constructor() {
        // Automatically fetch tasks and questions when lines are first set
        effect(() => {
            const currentLines = this.lines();
            // We only want to trigger this if we have lines but they don't have tasks/questions loaded yet
            // Or specifically when the researchId changes/initially loads
            const needsRefresh = currentLines.length > 0 &&
                currentLines.every(l => (l.tasks ?? []).length === 0 && (l.stageQuestions ?? []).length === 0);

            if (needsRefresh) {
                this.refreshAllLinesData();
            }
        });
    }

    // ── Modal state ──
    modal = signal<ModalType>('none');
    activeLineIndex = signal(-1);
    activeTaskIndex = signal(-1);

    // Temp form fields
    editLineTitle = '';
    editLineDescription = '';
    editLineDuration = '';
    newQuestionText = '';
    newTaskTitle = '';

    // ════════════════ Lines (columns) ════════════════

    addLine() {
        const newOrder = this.lines().length + 1;
        const dto: ResearchLineDto = {
            researchId: this.researchId(),
            title: 'Research Line ' + newOrder,
            sequenceOrder: newOrder,
            status: 'LOCKED',
            duration: ''
        };

        this.lineApiService.createResearchLine(dto).subscribe(saved => {
            const newLine: ResearchLineDto = {
                ...saved,
                description: '',
                stageQuestions: [],
                tasks: []
            };

            this.lines.update(list => [...list, newLine]);
            this.openEditLine(this.lines().length - 1);
        });
    }

    removeLine(index: number) {
        const line = this.lines()[index];
        if (line.id) {
            this.lineApiService.deleteResearchLine(line.id).subscribe(() => {
                this.lines.update(list => list.filter((_, i) => i !== index));
                this.closeModal();
            });
        } else {
            this.lines.update(list => list.filter((_, i) => i !== index));
            this.closeModal();
        }
    }

    refreshAllLinesData() {
        const currentLines = this.lines();
        currentLines.forEach((line, index) => {
            if (line.id) {
                this.stageQuestionApiService.getStageQuestionsByResearchLineId(line.id).subscribe(questions => {
                    this.lines.update(list =>
                        list.map((l, idx) =>
                            idx === index ? {...l, stageQuestions: questions} : l
                        )
                    );
                });
                this.taskApiService.getResearchTasksByResearchLineId(line.id).subscribe(tasks => {
                    this.lines.update(list =>
                        list.map((l, idx) =>
                            idx === index
                                ? {
                                    ...l,
                                    tasks: tasks.map(t => {
                                        const existing = (l.tasks ?? []).find(et => et.id === t.id);
                                        return {
                                            ...t,
                                            logEntries: existing?.logEntries ?? [],
                                            artifacts: existing?.artifacts ?? []
                                        };
                                    })
                                }
                                : l
                        )
                    );
                });
            }
        });
    }

    // ════════════════ Modal: Edit Line ════════════════

    openEditLine(lineIndex: number) {
        const line = this.lines()[lineIndex];
        this.activeLineIndex.set(lineIndex);
        this.editLineTitle = line.title;
        this.editLineDescription = line.description ?? '';
        this.editLineDuration = line.duration ?? '';
        this.modal.set('editLine');
    }

    saveEditLine() {
        const i = this.activeLineIndex();
        const line = this.lines()[i];

        if (line.id) {
            const dto: ResearchLineDto = {
                id: line.id,
                researchId: this.researchId(),
                title: this.editLineTitle.trim() || line.title,
                sequenceOrder: i + 1,
                status: 'LOCKED',
                duration: this.editLineDuration
            };

            this.lineApiService.updateResearchLine(dto).subscribe(updated => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === i
                            ? {
                                ...l,
                                title: updated.title,
                                description: this.editLineDescription,
                                duration: updated.duration || ''
                            }
                            : l
                    )
                );
            });
        }

        this.closeModal();
    }

    // ════════════════ Modal: Stage Questions ════════════════

    openStageQuestions(lineIndex: number) {
        const line = this.lines()[lineIndex];
        this.activeLineIndex.set(lineIndex);
        this.newQuestionText = '';
        this.modal.set('stageQuestions');

        // Load fresh questions from backend for this line
        if (line.id) {
            this.stageQuestionApiService.getStageQuestionsByResearchLineId(line.id).subscribe(questions => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === lineIndex ? {...l, stageQuestions: questions} : l
                    )
                );
            });
        }
    }

    addStageQuestion() {
        const text = this.newQuestionText.trim();
        if (!text) return;
        const i = this.activeLineIndex();
        const line = this.lines()[i];

        if (line.id) {
            const dto: StageQuestionDto = {
                researchLineId: line.id,
                text: text,
                status: 'DRAFT'
            };

            this.stageQuestionApiService.createStageQuestion(dto).subscribe(saved => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === i ? {...l, stageQuestions: [...(l.stageQuestions ?? []), saved]} : l
                    )
                );
                this.newQuestionText = '';
            });
        }
    }

    removeStageQuestion(qIndex: number) {
        const i = this.activeLineIndex();
        const line = this.lines()[i];
        const question = (line.stageQuestions ?? [])[qIndex];

        if (question?.id) {
            this.stageQuestionApiService.deleteStageQuestion(question.id).subscribe(() => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === i ? {...l, stageQuestions: (l.stageQuestions ?? []).filter((_, j) => j !== qIndex)} : l
                    )
                );
            });
        }
    }

    // ════════════════ Tasks ════════════════

    addTask(lineIndex: number) {
        if (this.readonly()) return;
        const text = this.newTaskTitle.trim();
        if (!text) return;

        const line = this.lines()[lineIndex];
        if (line.id) {
            const dto: ResearchTaskDto = {
                researchLineId: line.id,
                title: text,
                description: '',
                status: 'OPEN'
            };

            this.taskApiService.createResearchTask(dto).subscribe(saved => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === lineIndex
                            ? {
                                ...l, tasks: [...(l.tasks ?? []), {
                                    ...saved,
                                    logEntries: [],
                                    artifacts: []
                                }]
                            }
                            : l
                    )
                );
                this.newTaskTitle = '';
            });
        }
    }

    removeTask(lineIndex: number, taskIndex: number) {
        if (this.readonly()) return;
        const line = this.lines()[lineIndex];
        const task = (line.tasks ?? [])[taskIndex];

        if (task?.id) {
            this.taskApiService.deleteResearchTask(task.id).subscribe(() => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === lineIndex ? {...l, tasks: (l.tasks ?? []).filter((_, j) => j !== taskIndex)} : l
                    )
                );
                this.closeModal();
            });
        } else {
            this.lines.update(list =>
                list.map((l, idx) =>
                    idx === lineIndex ? {...l, tasks: (l.tasks ?? []).filter((_, j) => j !== taskIndex)} : l
                )
            );
            this.closeModal();
        }
    }

    // ════════════════ Modal: Edit Task ════════════════

    openEditTask(lineIndex: number, taskIndex: number) {
        const line = this.lines()[lineIndex];
        this.activeLineIndex.set(lineIndex);

        // Load fresh tasks for this line to ensure we have latest data
        if (line.id) {
            this.taskApiService.getResearchTasksByResearchLineId(line.id).subscribe(tasks => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === lineIndex
                            ? {
                                ...l,
                                tasks: tasks.map(t => {
                                    const existing = (l.tasks ?? []).find(et => et.id === t.id);
                                    return {
                                        ...t,
                                        logEntries: existing?.logEntries ?? [],
                                        artifacts: existing?.artifacts ?? []
                                    };
                                })
                            }
                            : l
                    )
                );
                this.activeTaskIndex.set(taskIndex);
                this.modal.set('editTask');
            });
        } else {
            this.activeTaskIndex.set(taskIndex);
            this.modal.set('editTask');
        }
    }

    activeTask(): ResearchTaskDto | null {
        const li = this.activeLineIndex();
        const ti = this.activeTaskIndex();
        if (li < 0 || ti < 0) return null;
        return (this.lines()[li]?.tasks ?? [])[ti] ?? null;
    }

    onTaskSave(updated: ResearchTaskDto) {
        const li = this.activeLineIndex();
        const ti = this.activeTaskIndex();
        const line = this.lines()[li];

        if (updated.id && line.id) {
            const dto: ResearchTaskDto = {
                id: updated.id,
                researchLineId: line.id,
                title: updated.title,
                description: updated.description,
                status: updated.status || 'OPEN'
            };

            this.taskApiService.updateResearchTask(dto).subscribe(saved => {
                this.lines.update(list =>
                    list.map((l, idx) =>
                        idx === li
                            ? {...l, tasks: (l.tasks ?? []).map((t, j) => j === ti ? {...updated, ...saved} : t)}
                            : l
                    )
                );
            });
        }

        this.closeModal();
    }

    onTaskDelete() {
        this.removeTask(this.activeLineIndex(), this.activeTaskIndex());
    }

    // ════════════════ Helpers ════════════════

    closeModal() {
        this.modal.set('none');
    }

    activeLine(): ResearchLineDto | null {
        const i = this.activeLineIndex();
        return i >= 0 ? this.lines()[i] ?? null : null;
    }
}
