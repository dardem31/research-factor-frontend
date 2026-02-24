import { Injectable, inject } from '@angular/core';
import { ResearchStateService } from './research-state.service';
import { Research } from '../../models/research/research.model';
import { CreateResearchInput, UpdateResearchInput } from '../../dtos/research/research-inputs.dto';

/**
 * Service for Research CRUD operations (legacy localStorage-based)
 * @deprecated This will be replaced by API-based operations
 */
@Injectable({ providedIn: 'root' })
export class ResearchCrudService {
  private state = inject(ResearchStateService);

  createResearch(input: CreateResearchInput): Research {
    const project: Research = {
      id: crypto.randomUUID(),
      title: input.title,
      hypothesis: input.hypothesis,
      description: input.description,
      status: 'DRAFT',
      ethicsApprovalDocument: null,
      subjectGroups: input.subjectGroups.map(g => ({
        id: crypto.randomUUID(),
        label: g.label,
        description: g.description,
        subjects: g.subjects.map(s => ({
          id: crypto.randomUUID(),
          code: s.code,
          remarks: s.remarks,
          kycVerified: s.kycVerified,
          groupId: '',
          parameterFields: s.parameterValues.map(pv => ({
            id: crypto.randomUUID(),
            parameterId: pv.parameterId,
            currentValue: pv.value,
            updatedAt: new Date().toISOString(),
          })),
        })),
      })),
      trackedParameters: input.trackedParameters.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        unit: p.unit,
      })),
      protocol: {
        id: crypto.randomUUID(),
        ...input.protocol,
      },
      primaryOutcomes: input.primaryOutcomes.map(text => ({
        id: crypto.randomUUID(),
        text,
        status: 'DRAFT' as const,
      })),
      lines: [],
      report: null,
      createdAt: new Date().toISOString(),
    };

    this.state.addProject(project);
    return project;
  }

  updateResearch(id: string, input: UpdateResearchInput): void {
    this.state.updateProject(id, p => ({
      ...p,
      title: input.title,
      hypothesis: input.hypothesis,
      description: input.description,
      protocol: {
        ...p.protocol,
        ...input.protocol,
      },
      primaryOutcomes: input.primaryOutcomes.map(text => {
        const existing = p.primaryOutcomes.find(o => o.text === text);
        return existing ?? { id: crypto.randomUUID(), text, status: 'DRAFT' as const };
      }),
      subjectGroups: input.subjectGroups.map(gi => {
        const existing = p.subjectGroups.find(g => g.label === gi.label);
        if (existing) {
          return {
            ...existing,
            description: gi.description,
            subjects: gi.subjects.map(si => {
              const existingSubject = existing.subjects.find(s => s.code === si.code);
              return existingSubject
                ? {
                    ...existingSubject,
                    remarks: si.remarks,
                    kycVerified: si.kycVerified,
                    parameterFields: si.parameterValues.map(pv => {
                      const ef = existingSubject.parameterFields.find(f => f.parameterId === pv.parameterId);
                      return ef
                        ? { ...ef, currentValue: pv.value }
                        : {
                            id: crypto.randomUUID(),
                            parameterId: pv.parameterId,
                            currentValue: pv.value,
                            updatedAt: new Date().toISOString(),
                          };
                    }),
                  }
                : {
                    id: crypto.randomUUID(),
                    code: si.code,
                    remarks: si.remarks,
                    kycVerified: si.kycVerified,
                    groupId: existing.id,
                    parameterFields: si.parameterValues.map(pv => ({
                      id: crypto.randomUUID(),
                      parameterId: pv.parameterId,
                      currentValue: pv.value,
                      updatedAt: new Date().toISOString(),
                    })),
                  };
            }),
          };
        }
        return {
          id: crypto.randomUUID(),
          label: gi.label,
          description: gi.description,
          subjects: gi.subjects.map(si => ({
            id: crypto.randomUUID(),
            code: si.code,
            remarks: si.remarks,
            kycVerified: si.kycVerified,
            groupId: '',
            parameterFields: si.parameterValues.map(pv => ({
              id: crypto.randomUUID(),
              parameterId: pv.parameterId,
              currentValue: pv.value,
              updatedAt: new Date().toISOString(),
            })),
          })),
        };
      }),
      trackedParameters: input.trackedParameters.map(tp => {
        const existing = p.trackedParameters.find(t => t.name === tp.name && t.unit === tp.unit);
        return existing ?? { id: crypto.randomUUID(), name: tp.name, unit: tp.unit };
      }),
    }));
  }

  deleteResearch(id: string): void {
    this.state.removeProject(id);
  }

  submitForReview(id: string): void {
    this.state.updateProject(id, p => ({
      ...p,
      status: 'PENDING_REVIEW',
    }));
  }
}
