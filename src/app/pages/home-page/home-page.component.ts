import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BrowserStorageService } from '../../core/services/browser-storage.service';
import { CommentPageComponent } from '../comment-page/comment-page.component';

type Category = 'entrée' | 'plat' | 'dessert' | '';

export interface Recipe {
  id: number;
  title: string;
  category: Category | string;
  image?: string;
  description?: string;
  servings: number;
}

const LS_RECIPES_KEY = 'recipes';
const LS_LIKES_KEY   = 'likedRecipes';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent,
    CommentPageComponent
],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private readonly storage = inject(BrowserStorageService);
  private router = inject(Router);

  searchQuery = '';
  selectedCategory: Category | string = '';

  recipes: Recipe[] = [];
  private likedIds = new Set<number>();

  showCommentForId = new Set<number>();

  constructor() {
    this.loadRecipesFromStorage();
    this.loadLikesFromStorage();
  }

  /* --------------------------------- Recettes ---------------------------------- */
  private loadRecipesFromStorage(): void {
    this.recipes = this.storage.getArray<Recipe>(LS_RECIPES_KEY, (r): r is Recipe =>
      !!r && typeof r === 'object' && 'id' in r && typeof r.id === 'number' &&
      'title' in r && typeof r.title === 'string');
    // Sécurité minimale : s’assurer que chaque recette a un id numérique
    this.recipes = this.recipes
      .filter(r => r && typeof r.id === 'number')
      .map(r => ({
        ...r,
        servings: typeof r.servings === 'number' && r.servings > 0 ? r.servings : 1,
      }));
  }

  private persistRecipes(): void {
    this.storage.set(LS_RECIPES_KEY, this.recipes);
  }

  /* ---------------------------------- Likes ------------------------------------ */
  private loadLikesFromStorage(): void {
    const arr = this.storage.getArray<number>(LS_LIKES_KEY, (id): id is number => typeof id === 'number');
    this.likedIds = new Set(arr);
  }

  private persistLikes(): void {
    this.storage.set(LS_LIKES_KEY, Array.from(this.likedIds));
  }

  isLiked(id: number): boolean {
    return this.likedIds.has(id);
  }

  toggleLike(id: number): void {
    if (this.isLiked(id)) {
      this.likedIds.delete(id);
    } else {
      this.likedIds.add(id);
    }
    this.persistLikes();
  }

  /* ------------------------------- Filtrage UI --------------------------------- */
  filteredRecipes(): Recipe[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = (this.selectedCategory || '').toLowerCase();

    return this.recipes.filter((r) => {
      const inCat = !cat || (String(r.category || '').toLowerCase() === cat);
      const inQuery =
        !q ||
        String(r.title || '').toLowerCase().includes(q) ||
        String(r.description || '').toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }

  trackByRecipeId(_: number, recipe: Recipe): number {
    return recipe.id;
  }

  /* ------------------------------ Actions UI ----------------------------------- */
  addRecipe(): void {
    // Redirige vers la page de création
    this.router.navigate(['/create-recipe']);
  }

  viewRecipe(id: number): void {
    // D’après ton projet, la page create-recipe gère les modes via queryParams
    this.router.navigate(['/create-recipe'], { queryParams: { id, mode: 'view' } });
  }

  editRecipe(id: number): void {
    this.router.navigate(['/create-recipe'], { queryParams: { id, mode: 'edit' } });
  }

  deleteRecipe(id: number): void {
    // Tu peux remplacer par un MatDialog si tu préfères
    const ok = confirm('Supprimer cette recette ?');
    if (!ok) return;

    this.recipes = this.recipes.filter(r => r.id !== id);
    // Nettoyer aussi l’état des likes et commentaires associés
    this.likedIds.delete(id);
    this.showCommentForId.delete(id);

    this.persistRecipes();
    this.persistLikes();
    this.storage.remove(`comments_${id}`);
  }

  toggleComments(id: number): void {
    if (this.showCommentForId.has(id)) {
      this.showCommentForId.delete(id);
    } else {
      this.showCommentForId.add(id);
    }
  }
}