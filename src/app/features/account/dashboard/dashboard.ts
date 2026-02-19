import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ResearchService} from '../../../core/services/research.service';
import {ResearchStatus} from '../../../core/models/research.model';

@Component({
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [RouterLink, DatePipe],
})
export default class DashboardPage {
  research = inject(ResearchService);

  delete(id: string) {
    if (confirm('Удалить проект?')) {
      this.research.deleteResearch(id);
    }
  }

  submitForReview(id: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Отправить проект на рецензирование? После отправки редактирование будет недоступно.')) {
      this.research.submitForReview(id);
    }
  }

  statusLabel(status: ResearchStatus): string {
    const map: Record<ResearchStatus, string> = {
      DRAFT: 'Черновик',
      PENDING_REVIEW: 'На рецензии',
      PUBLISHED: 'Опубликован',
      ACTIVE: 'Активный',
      COMPLETED: 'Завершён',
    };
    return map[status] ?? status;
  }

  statusColor(status: ResearchStatus): string {
    const map: Record<ResearchStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      PUBLISHED: 'bg-blue-100 text-blue-700',
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-indigo-100 text-indigo-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
