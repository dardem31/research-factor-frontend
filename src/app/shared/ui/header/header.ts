import {Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LoginDialog} from '../login-dialog/login-dialog';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'hk-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [LoginDialog, RouterLink],
})
export class Header {
  auth = inject(AuthService);
  showLogin = signal(false);

  openLogin() {
    this.showLogin.set(true);
  }

  closeLogin() {
    this.showLogin.set(false);
  }
}
