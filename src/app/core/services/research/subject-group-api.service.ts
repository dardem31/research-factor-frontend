import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SubjectGroupCreateDto,
  SubjectGroupDto,
  SubjectGroupUpdateDto,
} from '../../dtos/subject/subject-group.dto';

@Injectable({
  providedIn: 'root',
})
export class SubjectGroupApiService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}api/v1/dashboard/subject-groups`;

  createSubjectGroup(dto: SubjectGroupCreateDto): Observable<SubjectGroupDto> {
    return this.http.post<SubjectGroupDto>(this.API_URL, dto, { withCredentials: true });
  }

  updateSubjectGroup(id: number, dto: SubjectGroupUpdateDto): Observable<SubjectGroupDto> {
    return this.http.put<SubjectGroupDto>(`${this.API_URL}/${id}`, dto, { withCredentials: true });
  }

  listSubjectGroups(researchId: number): Observable<SubjectGroupDto[]> {
    return this.http.get<SubjectGroupDto[]>(`${this.API_URL}/${researchId}`, { withCredentials: true });
  }
}
