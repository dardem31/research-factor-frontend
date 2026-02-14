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
    ],
  },
];
