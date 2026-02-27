import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StageQuestionDto } from '../../dtos/research/stage-question.dto';

@Injectable({
  providedIn: 'root'
})
export class StageQuestionApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiBaseUrl;
  private readonly baseUrl = 'api/v1/dashboard/research/research-lines/stage-questions';

  getStageQuestionsByResearchLineId(researchLineId: number): Observable<StageQuestionDto[]> {
    return this.http.get<StageQuestionDto[]>(
      `${this.API_URL}${this.baseUrl}/${researchLineId}`,
      { withCredentials: true }
    );
  }

  createStageQuestion(dto: StageQuestionDto): Observable<StageQuestionDto> {
    return this.http.post<StageQuestionDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  updateStageQuestion(dto: StageQuestionDto): Observable<StageQuestionDto> {
    return this.http.put<StageQuestionDto>(
      `${this.API_URL}${this.baseUrl}`,
      dto,
      { withCredentials: true }
    );
  }

  deleteStageQuestion(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${this.baseUrl}/${id}`,
      { withCredentials: true }
    );
  }
}
