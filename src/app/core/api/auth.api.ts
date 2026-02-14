import {Injectable} from '@angular/core';
import {LoginRequest} from './dto/login-request.dto';
import {ApiClient} from './api-client';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private apiClient: ApiClient) {}

  login(request: LoginRequest) {
    return this.apiClient.post(
      'api/v1/auth/login',
      request,
      { withCredentials: true }
    );
  }

  me() {
    return this.apiClient.get(
      'api/v1/dashboard/me',
      { withCredentials: true }
    )
  }
}
