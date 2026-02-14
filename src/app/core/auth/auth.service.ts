import {computed, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
  private _authenticated = signal(false);
  isAuthenticated = computed(() => this._authenticated());

  private _username = signal<string | null>(null);
  username = computed(() => this._username());

  constructor(private router: Router) {}

  /** Called on app init — restore session from localStorage */
  init() {
    const saved = localStorage.getItem('rf_user');
    if (saved) {
      this._authenticated.set(true);
      this._username.set(saved);
    }
    return of(null);
  }

  /** Stub login — no backend needed */
  login(username: string, _password: string) {
    this._authenticated.set(true);
    this._username.set(username);
    localStorage.setItem('rf_user', username);
    this.router.navigate(['/account']);
    return of(true);
  }

  logout() {
    this._authenticated.set(false);
    this._username.set(null);
    localStorage.removeItem('rf_user');
    this.router.navigate(['/']);
  }
}

