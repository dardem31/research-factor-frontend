import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResearchLineDto } from '../../dtos/research/research-line.dto';

@Injectable({ providedIn: 'root' })
export class ResearchLineApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;

  getResearchLinesByResearchId(researchId: number): Observable<ResearchLineDto[]> {
    return this.http.get<ResearchLineDto[]>(
      `${this.API_URL}api/v1/dashboard/research/research-line/${researchId}`,
      { withCredentials: true }
    );
  }

  createResearchLine(dto: ResearchLineDto): Observable<ResearchLineDto> {
    return this.http.post<ResearchLineDto>(
      `${this.API_URL}api/v1/dashboard/research/research-line`,
      dto,
      { withCredentials: true }
    );
  }

  updateResearchLine(dto: ResearchLineDto): Observable<ResearchLineDto> {
    return this.http.put<ResearchLineDto>(
      `${this.API_URL}api/v1/dashboard/research/research-line`,
      dto,
      { withCredentials: true }
    );
  }

  deleteResearchLine(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}api/v1/dashboard/research/research-line/${id}`,
      { withCredentials: true }
    );
  }
}
