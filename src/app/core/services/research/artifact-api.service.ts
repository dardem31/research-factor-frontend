import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ArtifactDto } from '../../dtos/research/artifact.dto';

@Injectable({
  providedIn: 'root'
})
export class ArtifactApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;
  private readonly baseUrl = 'api/v1/dashboard/research/research-line/task/artifact';

  getArtifactsByTaskId(taskId: number): Observable<ArtifactDto[]> {
    return this.http.get<ArtifactDto[]>(
      `${this.API_URL}${this.baseUrl}/${taskId}`,
      { withCredentials: true }
    );
  }

  createArtifact(dto: ArtifactDto): Observable<ArtifactDto> {
    return this.http.post<ArtifactDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  updateArtifact(dto: ArtifactDto): Observable<ArtifactDto> {
    return this.http.put<ArtifactDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  deleteArtifact(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${this.baseUrl}/${id}`,
      { withCredentials: true }
    );
  }
}
