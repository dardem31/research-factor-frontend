import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ResearchService, ResearchOverviewItem} from '../../../core/services/research.service';

@Component({
  standalone: true,
  templateUrl: './pending-review.html',
  imports: [DatePipe],
})
export default class PendingReviewPage implements OnInit {
  private researchService = inject(ResearchService);
  private router = inject(Router);

  researchItems = signal<ResearchOverviewItem[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal(false);

  ngOnInit() {
    this.loadResearch();
  }

  loadResearch() {
    this.isLoading.set(true);
    const filter = {
      pagination: { limit: 20, order: 'prev' as const }
    };

    this.researchService.listPendingReview(filter).subscribe({
      next: (res) => {
        this.researchItems.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.researchService.countPendingReview(filter).subscribe({
      next: (res) => this.totalCount.set(res.count)
    });
  }

  openResearch(id: string) {
    this.router.navigate(['/account/research', id]);
  }

  delete(id: string) {
    if (confirm('Удалить проект?')) {
      this.researchService.deleteResearch(id);
      this.loadResearch();
    }
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Черновик',
      PENDING_REVIEW: 'На рецензии',
      PUBLISHED: 'Опубликован',
      ACTIVE: 'Активный',
      COMPLETED: 'Завершён',
    };
    return map[status] ?? status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      PUBLISHED: 'bg-blue-100 text-blue-700',
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-indigo-100 text-indigo-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
