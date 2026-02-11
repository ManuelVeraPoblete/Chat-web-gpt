import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

import { API_CONFIG } from './core/config/api-config.token';
import { baseUrlInterceptor } from './core/http/interceptors/base-url.interceptor';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { errorMappingInterceptor } from './core/http/interceptors/error-mapping.interceptor';
import { authUnauthorizedInterceptor } from './core/http/interceptors/auth-unauthorized.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),

    provideRouter(appRoutes),

    {
      provide: API_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        socketUrl: environment.apiBaseUrl,
      },
    },

    /**
     * ✅ ORDEN CRÍTICO (FIX):
     * Request:  baseUrl -> errorMapping -> auth -> unauthorized -> backend
     * Response: backend -> unauthorized -> auth -> errorMapping -> baseUrl
     *
     * Así authInterceptor ve HttpErrorResponse (401) y puede refrescar.
     * Si aún queda 401, unauthorized limpia estado y redirige a /login.
     */
    provideHttpClient(
      withInterceptors([
        baseUrlInterceptor,
        errorMappingInterceptor,
        authInterceptor,
        authUnauthorizedInterceptor,
      ]),
    ),
  ],
};
