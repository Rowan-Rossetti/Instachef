import { Component, signal, WritableSignal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommonModule
} from '@angular/common';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  FormsModule
} from '@angular/forms';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatSelectModule
} from '@angular/material/select';
import {
  MatTooltipModule
} from '@angular/material/tooltip';
import {
  HeaderComponent
} from '../../components/header/header.component';
import {
  FooterComponent
} from '../../components/footer/footer.component';
import {
  CommentPageComponent
} from '../../pages/comment-page/comment-page.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent,
    CommentPageComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  recipes = signal<any[]>([]);
  searchQuery = '';
  selectedCategory = '';
  showCommentForId = new Set<number>();
  likedRecipeIds: WritableSignal<Set<number>> = signal(this.loadLikedRecipeIds());

  constructor(private router: Router) {
    this.loadRecipes();
  }

  loadRecipes(): void {
    const data = localStorage.getItem('recipes');
    this.recipes.set(data ? JSON.parse(data) : []);
  }

  addRecipe(): void {
    this.router.navigate(['/create-recipe']);
  }

  deleteRecipe(id: number): void {
    const updated = this.recipes().filter(r => r.id !== id);
    localStorage.setItem('recipes', JSON.stringify(updated));
    this.recipes.set(updated);
  }

  viewRecipe(id: string): void {
    this.router.navigate(['/create-recipe'], { queryParams: { mode: 'view', id } });
  }

  editRecipe(id: string): void {
    this.router.navigate(['/create-recipe'], { queryParams: { mode: 'edit', id } });
  }

  toggleComments(id: number): void {
    if (this.showCommentForId.has(id)) {
      this.showCommentForId.delete(id);
    } else {
      this.showCommentForId.add(id);
    }
  }

  toggleLike(id: number): void {
    const current = new Set(this.likedRecipeIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.likedRecipeIds.set(current);
    localStorage.setItem('likedRecipeIds', JSON.stringify([...current]));
  }

  isLiked(id: number): boolean {
    return this.likedRecipeIds().has(id);
  }

  loadLikedRecipeIds(): Set<number> {
    const data = localStorage.getItem('likedRecipeIds');
    return data ? new Set(JSON.parse(data)) : new Set<number>();
  }

  trackByRecipeId(index: number, recipe: any): number {
    return recipe.id;
  }

  filteredRecipes = computed(() => {
    return this.recipes().filter(recipe => {
      const matchesSearch = recipe.title?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory ? recipe.category === this.selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  });
}