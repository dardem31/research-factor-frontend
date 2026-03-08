import {Routes} from '@angular/router';
import {PublicLayout} from '../../shared/ui/layouts/public-layout/public-layout';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home'),
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./showcase/showcase'),
      },
      {
        path: 'research/:id',
        loadComponent: () =>
          import('../../features/account/research-detail/research-detail'),
        data: { publicMode: true },
      },
    ],
  },
];
