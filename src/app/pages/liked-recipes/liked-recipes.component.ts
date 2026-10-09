import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { BrowserStorageService } from '../../core/services/browser-storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface LikedRecipe {
  id: number;
  title?: string;
  name?: string;
  image?: string;
  description?: string;
  servings?: number;
  [key: string]: unknown;
}

const LS_RECIPES_KEY = 'recipes';
const LS_LIKES_KEY   = 'likedRecipes';     // même clé que sur HomePage
const LS_OLD_LIKES   = 'likedRecipeIds';   // fallback pour anciennes données

@Component({
  selector: 'app-liked-recipes',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './liked-recipes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./liked-recipes.component.scss']
})
export class LikedRecipesComponent {
  private readonly storage = inject(BrowserStorageService);
  private router = inject(Router);
  recipes = signal<LikedRecipe[]>(this.getLikedRecipes()); // recettes filtrées (likées)

  private readLikedIds(): Set<number> {
    const key = this.storage.has(LS_LIKES_KEY) ? LS_LIKES_KEY : LS_OLD_LIKES;
    return new Set(this.storage.getArray<number>(key, (id): id is number => typeof id === 'number'));
  }

  private writeLikedIds(ids: Set<number>): void {
    this.storage.set(LS_LIKES_KEY, [...ids]);
  }

  private getAllRecipes(): LikedRecipe[] {
    return this.storage.getArray<LikedRecipe>(LS_RECIPES_KEY, (recipe): recipe is LikedRecipe =>
      !!recipe && typeof recipe === 'object' && 'id' in recipe && typeof recipe.id === 'number');
  }

  // Recettes likées = recettes dont l'id est dans likedIds
  private getLikedRecipes(): LikedRecipe[] {
    const likedIds = this.readLikedIds();
    return this.getAllRecipes().filter(r => r && typeof r.id === 'number' && likedIds.has(r.id));
  }

  // Supprime un like et rafraîchit la liste
  removeLike(id: number, event?: Event): void {
    event?.stopPropagation();
    const likedIds = this.readLikedIds();
    likedIds.delete(id);
    this.writeLikedIds(likedIds);
    this.recipes.set(this.getLikedRecipes());
  }

  viewRecipe(id: number): void {
    this.router.navigate(['/create-recipe'], { queryParams: { id, mode: 'view' } });
  }

  // Utile pour *ngFor trackBy
  trackById = (_: number, r: LikedRecipe) => r?.id;
}