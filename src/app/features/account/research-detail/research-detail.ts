import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ResearchService} from '../../../core/services/research.service';
import {LineStatus, ObjectiveStatus, TaskStatus} from '../../../core/models/research.model';

@Component({
  standalone: true,
  templateUrl: './research-detail.html',
  imports: [RouterLink],
})
export default class ResearchDetailPage {
  private route = inject(ActivatedRoute);
  private researchService = inject(ResearchService);

  private projectId = this.route.snapshot.paramMap.get('id')!;

  project = computed(() => this.researchService.getById(this.projectId));

  lineStatusLabel(status: LineStatus): string {
    const map: Record<LineStatus, string> = {
      LOCKED: '🔒 Locked',
      ACTIVE: '🟢 Active',
      COMPLETED: '✅ Completed',
    };
    return map[status];
  }

  lineStatusColor(status: LineStatus): string {
    const map: Record<LineStatus, string> = {
      LOCKED: 'bg-gray-100 text-gray-600',
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };
    return map[status];
  }

  objectiveStatusColor(status: ObjectiveStatus): string {
    const map: Record<ObjectiveStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      FULFILLED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[status];
  }

  taskStatusColor(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-700',
      SUBMITTED: 'bg-green-100 text-green-700',
    };
    return map[status];
  }
}
