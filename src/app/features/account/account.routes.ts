import {Routes} from '@angular/router';
import {AccountLayout} from '../../shared/ui/layouts/account-layout/account-layout';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard'),
      },
      {
        path: 'new',
        loadComponent: () => import('./research-create/research-create'),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./research-create/research-create'),
      }
    ],
  },
];
