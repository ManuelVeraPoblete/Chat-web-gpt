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

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),

    //Router activo
    provideRouter(appRoutes),

    //Config API
    {
      provide: API_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        socketUrl: environment.apiBaseUrl,
      },
    },

    //HttpClient + interceptors
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor, errorMappingInterceptor])),
  ],
};
