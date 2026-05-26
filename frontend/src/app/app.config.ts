import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; 
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    })),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideHttpClient(
      withFetch(), 
      withInterceptors([authInterceptor])
    )
  ]
};