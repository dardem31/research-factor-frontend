import {computed, Injectable, signal, inject} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {LoginRequest, UserDto} from './auth.models';

@Injectable({providedIn: 'root'})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private _authenticated = signal(false);
    isAuthenticated = computed(() => this._authenticated());

    private _user = signal<UserDto | null>(null);
    user = computed(() => this._user());

    private readonly API_URL = environment.apiBaseUrl.endsWith('/')
        ? environment.apiBaseUrl
        : `${environment.apiBaseUrl}/`;

    /** Called on app init — check session from backend */
    init(): Observable<UserDto | null> {
        return this.getCurrentUser().pipe(
            tap(user => {
                this._authenticated.set(true);
                this._user.set(user);
            }),
            catchError(() => {
                this._authenticated.set(false);
                this._user.set(null);
                return of(null);
            })
        );
    }

    getCurrentUser(): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.API_URL}api/v1/dashboard/me`, {withCredentials: true});
    }

    /** Login with backend authentication */
    login(username: string, password: string): Observable<UserDto> {
        const loginRequest: LoginRequest = {username, password};
        return this.http.post<void>(`${this.API_URL}api/v1/auth/login`, loginRequest, {
            withCredentials: true
        }).pipe(
            tap(() => this._authenticated.set(true)),
            switchMap(() => this.getCurrentUser()),
            tap(user => {
                this._user.set(user);
                this.router.navigate(['/account']);
            }),
            catchError(err => {
                this._authenticated.set(false);
                this._user.set(null);
                return throwError(() => err);
            })
        );
    }

    logout() {
        this._authenticated.set(false);
        this._user.set(null);
        this.router.navigate(['/']);
    }
}
