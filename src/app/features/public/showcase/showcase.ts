import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchPublicApiService } from '../../../core/services/research/research-public-api.service';
import { ResearchOverviewItem } from '../../../core/dtos/research/research-overview-item.dto';

@Component({
  standalone: true,
  templateUrl: './showcase.html',
  imports: [DatePipe, FormsModule],
})
export default class ShowcasePage implements OnInit {
  private publicApi = inject(ResearchPublicApiService);
  private router = inject(Router);

  researchItems = signal<ResearchOverviewItem[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal(false);
  searchQuery = signal('');

  ngOnInit() {
    this.loadResearch();
  }

  loadResearch() {
    this.isLoading.set(true);
    const filter = {
      filter: this.searchQuery() ? { title: this.searchQuery() } : undefined,
      pagination: { limit: 20, order: 'prev' as const },
    };

    this.publicApi.listPublished(filter).subscribe({
      next: (res) => {
        this.researchItems.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.publicApi.countPublished(filter).subscribe({
      next: (res) => this.totalCount.set(res.count),
    });
  }

  onSearch() {
    this.loadResearch();
  }

  openResearch(id: string) {
    this.router.navigate(['/research', id]);
  }
}
