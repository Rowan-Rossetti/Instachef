import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './app.routes.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', loadComponent: () => import('./pages/auth-page/auth-page.component').then(m => m.AuthPageComponent), canActivate: [guestGuard] },
  { path: 'home', loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent), canActivate: [authGuard] },
  { path: 'create-recipe', loadComponent: () => import('./pages/create-recipe/create-recipe-page.component').then(m => m.CreateRecipePageComponent), canActivate: [authGuard] },
  { path: 'meal-planner', loadComponent: () => import('./pages/meal-planner/meal-planner.component').then(m => m.MealPlannerComponent), canActivate: [authGuard] },
  { path: 'liked-recipe', loadComponent: () => import('./pages/liked-recipes/liked-recipes.component').then(m => m.LikedRecipesComponent), canActivate: [authGuard] },
  { path: 'comments', loadComponent: () => import('./pages/comment-page/comment-page.component').then(m => m.CommentPageComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' }
];
