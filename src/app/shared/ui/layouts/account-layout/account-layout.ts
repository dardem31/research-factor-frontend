import {Component, inject, signal} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'rf-account-layout',
  templateUrl: './account-layout.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AccountLayout {
  auth = inject(AuthService);
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
