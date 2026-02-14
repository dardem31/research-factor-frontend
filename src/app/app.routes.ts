import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES),
  },
];
