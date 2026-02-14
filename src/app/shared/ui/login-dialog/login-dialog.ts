import {Component, EventEmitter, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'hk-login-dialog',
  templateUrl: './login-dialog.html',
  styleUrls: ['./login-dialog.scss'],
  imports: [CommonModule, FormsModule],
})
export class LoginDialog {
  @Output() close = new EventEmitter<void>();

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService) {}

  submit() {
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username, this.password)
      .pipe(
        tap({
          next: () => {
            this.loading.set(false);
            this.close.emit(); // закрываем диалог после успешного login
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set('Неверный логин или пароль');
            console.error(err);
          }
        })
      )
      .subscribe();
  }

  cancel() {
    this.close.emit();
  }
}
