import { Routes } from '@angular/router';

import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { CreateRecipePageComponent } from './pages/create-recipe/create-recipe-page.component';
import { MealPlannerComponent } from './pages/meal-planner/meal-planner.component';
import { LikedRecipesComponent } from './pages/liked-recipes/liked-recipes.component';
import { CommentPageComponent } from './pages/comment-page/comment-page.component';

export const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'create-recipe', component: CreateRecipePageComponent },
  { path: 'meal-planner', component: MealPlannerComponent },
  { path: 'liked-recipe', component: LikedRecipesComponent },
  { path: 'comments', component: CommentPageComponent },
  { path: '**', redirectTo: '' }
];