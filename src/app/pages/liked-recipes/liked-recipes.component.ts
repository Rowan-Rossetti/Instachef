import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-liked-recipes',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, HeaderComponent, FooterComponent],
  templateUrl: './liked-recipes.component.html',
  styleUrls: ['./liked-recipes.component.scss']
})
export class LikedRecipesComponent {
  recipes = signal(this.getLikedRecipes());

  getLikedRecipeIds(): Set<number> {
    const data = localStorage.getItem('likedRecipeIds');
    return data ? new Set(JSON.parse(data)) : new Set<number>();
  }

  getAllRecipes(): any[] {
    const data = localStorage.getItem('recipes');
    return data ? JSON.parse(data) : [];
  }

  getLikedRecipes(): any[] {
    const likedIds = this.getLikedRecipeIds();
    return this.getAllRecipes().filter(recipe => likedIds.has(recipe.id));
  }

  removeLike(id: number): void {
    const likedIds = this.getLikedRecipeIds();
    likedIds.delete(id);
    localStorage.setItem('likedRecipeIds', JSON.stringify([...likedIds]));
    this.recipes.set(this.getLikedRecipes());
  }
}