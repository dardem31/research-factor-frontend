import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  constructor(private http: HttpClient) {}

  private url(path: string) {
    return `${environment.apiBaseUrl}${path}`;
  }

  get<T>(path: string, options: any = {}) {
    return this.http.get<T>(this.url(path), {
      withCredentials: true,
      ...options
    });
  }

  post<T>(path: string, body: any, options: any = {}) {
    return this.http.post<T>(this.url(path), body, {
      withCredentials: true,
      ...options
    });
  }
}
