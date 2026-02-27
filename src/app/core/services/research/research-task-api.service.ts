import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResearchTaskDto } from '../../dtos/research/research-task.dto';

@Injectable({
  providedIn: 'root'
})
export class ResearchTaskApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;
  private readonly baseUrl = 'api/v1/dashboard/research/research-lines/tasks';

  getResearchTasksByResearchLineId(researchLineId: number): Observable<ResearchTaskDto[]> {
    return this.http.get<ResearchTaskDto[]>(
      `${this.API_URL}${this.baseUrl}/${researchLineId}`,
      { withCredentials: true }
    );
  }

  createResearchTask(dto: ResearchTaskDto): Observable<ResearchTaskDto> {
    return this.http.post<ResearchTaskDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  updateResearchTask(dto: ResearchTaskDto): Observable<ResearchTaskDto> {
    return this.http.put<ResearchTaskDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  deleteResearchTask(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${this.baseUrl}/${id}`,
      { withCredentials: true }
    );
  }
}
