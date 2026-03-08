import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubjectCreateDto, SubjectDto, SubjectUpdateDto } from '../../dtos/subject/subject.dto';

@Injectable({
  providedIn: 'root',
})
export class SubjectApiService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}api/v1/dashboard/subject`;

  createSubject(dto: SubjectCreateDto): Observable<SubjectDto> {
    return this.http.post<SubjectDto>(this.API_URL, dto, { withCredentials: true });
  }

  updateSubject(id: number, dto: SubjectUpdateDto): Observable<SubjectDto> {
    return this.http.put<SubjectDto>(`${this.API_URL}/${id}`, dto, { withCredentials: true });
  }

  listSubjectsByGroup(groupId: number): Observable<SubjectDto[]> {
    return this.http.get<SubjectDto[]>(`${this.API_URL}/group/${groupId}`, { withCredentials: true });
  }
}
