import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

const LS_RECIPES_KEY = 'recipes';
const LS_LIKES_KEY   = 'likedRecipes';     // même clé que sur HomePage
const LS_OLD_LIKES   = 'likedRecipeIds';   // fallback pour anciennes données

@Component({
  selector: 'app-liked-recipes',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, HeaderComponent, FooterComponent],
  templateUrl: './liked-recipes.component.html',
  styleUrls: ['./liked-recipes.component.scss']
})
export class LikedRecipesComponent {
  private platformId = inject(PLATFORM_ID);
  recipes = signal<any[]>(this.getLikedRecipes()); // recettes filtrées (likées)

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Lit un tableau d'IDs likés depuis localStorage
  private readLikedIds(): Set<number> {
    if (!this.isBrowser) return new Set<number>();

    // Clé officielle
    const main = localStorage.getItem(LS_LIKES_KEY);
    if (main) {
      try { return new Set<number>(JSON.parse(main)); } catch { /* noop */ }
    }

    // Fallback si des données plus anciennes existent
    const legacy = localStorage.getItem(LS_OLD_LIKES);
    if (legacy) {
      try { return new Set<number>(JSON.parse(legacy)); } catch { /* noop */ }
    }

    return new Set<number>();
  }

  // Écrit les IDs likés (clé officielle)
  private writeLikedIds(ids: Set<number>): void {
    if (!this.isBrowser) return;
    localStorage.setItem(LS_LIKES_KEY, JSON.stringify([...ids]));
  }

  // Toutes les recettes (depuis localStorage)
  private getAllRecipes(): any[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(LS_RECIPES_KEY);
    try { return data ? JSON.parse(data) : []; } catch { return []; }
  }

  // Recettes likées = recettes dont l'id est dans likedIds
  private getLikedRecipes(): any[] {
    const likedIds = this.readLikedIds();
    return this.getAllRecipes().filter(r => r && typeof r.id === 'number' && likedIds.has(r.id));
  }

  // Supprime un like et rafraîchit la liste
  removeLike(id: number): void {
    const likedIds = this.readLikedIds();
    likedIds.delete(id);
    this.writeLikedIds(likedIds);
    this.recipes.set(this.getLikedRecipes());
  }

  // Utile pour *ngFor trackBy
  trackById = (_: number, r: any) => r?.id;
}