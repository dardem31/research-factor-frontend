import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResearchDto } from '../../dtos/research/research.dto';
import { ResearchFilterDto } from '../../dtos/research/research-filter.dto';
import { SearchResultDto } from '../../dtos/research/search-result.dto';
import { ResearchOverviewItem } from '../../dtos/research/research-overview-item.dto';

@Injectable({ providedIn: 'root' })
export class ResearchPublicApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;

  listPublished(filter: ResearchFilterDto): Observable<SearchResultDto<ResearchOverviewItem>> {
    let params: any = {};
    if (filter.pagination) {
      params['pagination.limit'] = filter.pagination.limit;
      if (filter.pagination.startFrom) params['pagination.startFrom'] = filter.pagination.startFrom;
      if (filter.pagination.order) params['pagination.order'] = filter.pagination.order;
    }
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;

    return this.http.get<SearchResultDto<ResearchOverviewItem>>(
      `${this.API_URL}api/v1/research/list`,
      { params }
    );
  }

  countPublished(filter: ResearchFilterDto): Observable<{ count: number }> {
    let params: any = {};
    if (filter.filter?.title) params['filter.title'] = filter.filter.title;

    return this.http.get<{ count: number }>(
      `${this.API_URL}api/v1/research/count`,
      { params }
    );
  }

  getResearchById(id: string): Observable<ResearchDto> {
    return this.http.get<ResearchDto>(
      `${this.API_URL}api/v1/research/${id}`
    );
  }
}
