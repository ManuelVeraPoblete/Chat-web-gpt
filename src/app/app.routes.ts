// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const appRoutes: Routes = [
  /**
   * ✅ Raíz
   * - Antes: /home
   * - Ahora: /chat
   *
   * Nota:
   * - Si no hay sesión, el authGuard redirigirá a /login
   */
  { path: '', pathMatch: 'full', redirectTo: 'chat' },

  /**
   * ✅ Login (público)
   */
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  /**
   * ✅ Rutas protegidas (requiere sesión)
   */
  {
    path: '',
    canMatch: [authGuard],
    children: [
      /**
       * ✅ Chat (sin userId)
       * Sirve para entrar directo después del login.
       * Dentro del feature, tu ChatShell debe manejar el caso "sin userId"
       * seleccionando un usuario por defecto o mostrando placeholder.
       */
      {
        path: 'chat',
        loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
      },

      /**
       * ✅ Chat (con userId)
       */
      {
        path: 'chat/:userId',
        loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
      },

      /**
       * ✅ Compatibilidad: si alguien entra a /home lo mandamos a /chat
       * (así puedes borrar el módulo home sin romper bookmarks)
       */
      { path: 'home', pathMatch: 'full', redirectTo: 'chat' },
    ],
  },

  /**
   * ✅ Fallback:
   * - Antes: home
   * - Ahora: chat
   */
  { path: '**', redirectTo: 'chat' },
];
