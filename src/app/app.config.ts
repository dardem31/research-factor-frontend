import {ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {firstValueFrom} from 'rxjs';

import {routes} from './app.routes';
import {AuthService} from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.init());
    }),
  ],
};
