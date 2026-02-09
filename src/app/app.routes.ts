import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const appRoutes: Routes = [
  //raíz: manda a /home (el guard enviará a /login si no hay sesión)
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canMatch: [authGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'chat/:userId',
        loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
      },
    ],
  },

  //fallback
  { path: '**', redirectTo: 'home' },
];
