import { InjectionToken } from '@angular/core';
import type { ApiConfig } from './api-config';

/**
 * InjectionToken para configurar base URL sin acoplar a environment.
 */
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
