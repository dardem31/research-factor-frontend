import {Injectable, inject} from '@angular/core';
import {ResearchApiService} from './research/research-api.service';
import {ResearchStateService} from './research/research-state.service';
import {ResearchCrudService} from './research/research-crud.service';
import {ResearchLinesService} from './research/research-lines.service';
import type {ResearchFilterDto} from '../dtos/research/research-filter.dto';
import type {ResearchDto} from '../dtos/research/research.dto';
import type {CreateResearchInput, UpdateResearchInput} from '../dtos/research/research-inputs.dto';

// Re-export types for convenience
export type {BlindingType, ResearchDto} from '../dtos/research/research.dto';
export type {ResearchOverviewItem} from '../dtos/research/research-overview-item.dto';
export type {SearchResultDto} from '../dtos/research/search-result.dto';
export type {ResearchFilterDto} from '../dtos/research/research-filter.dto';

/**
 * Facade service that aggregates all research-related operations.
 * Delegates to specialized services; use .api / .state / .crud / .lines
 * for direct access when the shortcut methods below are not enough.
 */
@Injectable({providedIn: 'root'})
export class ResearchService {
    readonly api = inject(ResearchApiService);
    readonly state = inject(ResearchStateService);
    readonly crud = inject(ResearchCrudService);
    readonly lines = inject(ResearchLinesService);

    get projects() {
        return this.state.projects;
    }

    // ── State ──
    getById(id: string) {
        return this.state.getById(id);
    }

    // ── API ──
    listResearch(filter: ResearchFilterDto) {
        return this.api.listResearch(filter);
    }

    countResearch(filter: ResearchFilterDto) {
        return this.api.countResearch(filter);
    }

    getResearchById(id: string) {
        return this.api.getResearchById(id);
    }

    saveNewResearch(dto: ResearchDto) {
        return this.api.createResearch(dto);
    }

    // ── CRUD (legacy local) ──
    createResearch(input: CreateResearchInput) {
        return this.crud.createResearch(input);
    }

    updateResearch(id: string, input: UpdateResearchInput) {
        return this.crud.updateResearch(id, input);
    }

    deleteResearch(id: string) {
        return this.crud.deleteResearch(id);
    }

    submitForReview(id: string) {
        return this.api.submitForReview(id);
    }
    removeLine(projectId: string, lineId: string) {
        return this.lines.removeLine(projectId, lineId);
    }

    addTask(projectId: string, lineId: string, title: string) {
        return this.lines.addTask(projectId, lineId, title);
    }

    removeTask(projectId: string, lineId: string, taskId: string) {
        return this.lines.removeTask(projectId, lineId, taskId);
    }
}
