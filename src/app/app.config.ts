import {ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

import {routes} from './app.routes';
import {AuthService} from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.init());
    }),
  ],
};
