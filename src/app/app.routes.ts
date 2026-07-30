import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './app.routes.guard';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { CreateRecipePageComponent } from './pages/create-recipe/create-recipe-page.component';
import { MealPlannerComponent } from './pages/meal-planner/meal-planner.component';
import { LikedRecipesComponent } from './pages/liked-recipes/liked-recipes.component';
import { CommentPageComponent } from './pages/comment-page/comment-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', component: AuthPageComponent, canActivate: [guestGuard] },
  { path: 'home', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'create-recipe', component: CreateRecipePageComponent, canActivate: [authGuard] },
  { path: 'meal-planner', component: MealPlannerComponent, canActivate: [authGuard] },
  { path: 'liked-recipe', component: LikedRecipesComponent, canActivate: [authGuard] },
  { path: 'comments', component: CommentPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' }
];
