import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResearchCreateDto } from '../../dtos/research/research-create.dto';
import { ResearchFilterDto } from '../../dtos/research/research-filter.dto';
import { SearchResultDto } from '../../dtos/research/search-result.dto';
import { ResearchOverviewItem } from '../../dtos/research/research-overview-item.dto';

@Injectable({ providedIn: 'root' })
export class ResearchApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;

  listResearch(filter: ResearchFilterDto): Observable<SearchResultDto<ResearchOverviewItem>> {
    let params: any = {};
    if (filter.pagination) {
      params['pagination.limit'] = filter.pagination.limit;
      if (filter.pagination.startFrom) params['pagination.startFrom'] = filter.pagination.startFrom;
      if (filter.pagination.order) params['pagination.order'] = filter.pagination.order;
    }
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;
    if (filter.filter?.status) params['filter.status'] = filter.filter.status;

    return this.http.get<SearchResultDto<ResearchOverviewItem>>(
      `${this.API_URL}api/v1/dashboard/research/list`,
      { params, withCredentials: true }
    );
  }

  countResearch(filter: ResearchFilterDto): Observable<{ count: number }> {
    let params: any = {};
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;
    if (filter.filter?.status) params['filter.status'] = filter.filter.status;

    return this.http.get<{ count: number }>(
      `${this.API_URL}api/v1/dashboard/research/count`,
      { params, withCredentials: true }
    );
  }

  createResearch(research: ResearchCreateDto): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(
      `${this.API_URL}api/v1/dashboard/research`,
      research,
      { withCredentials: true }
    );
  }

  updateResearch(id: string, research: ResearchCreateDto): Observable<void> {
    return this.http.put<void>(
      `${this.API_URL}api/v1/dashboard/research/${id}`,
      research,
      { withCredentials: true }
    );
  }

  deleteResearch(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}api/v1/dashboard/research/${id}`,
      { withCredentials: true }
    );
  }

  submitForReview(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}api/v1/dashboard/research/${id}/submit-review`,
      {},
      { withCredentials: true }
    );
  }
}
