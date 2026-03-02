import {Routes} from '@angular/router';
import {AccountLayout} from '../../shared/ui/layouts/account-layout/account-layout';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountLayout,
    children: [
      {
        path: '',
        redirectTo: 'my-researches',
        pathMatch: 'full',
      },
      {
        path: 'my-researches',
        loadComponent: () => import('./dashboard/dashboard'),
      },
      {
        path: 'researches/pending-review',
        loadComponent: () => import('./pending-review/pending-review'),
      },
      {
        path: 'new',
        loadComponent: () => import('./research-detail/research-detail'),
      },
      {
        path: 'research/:id',
        loadComponent: () => import('./research-detail/research-detail'),
      }
    ],
  },
];
