import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-create-recipe-page',
  standalone: true,
  templateUrl: './create-recipe-page.component.html',
  styleUrl: './create-recipe-page.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class CreateRecipePageComponent implements OnInit {
  recipeForm!: FormGroup;
  recipeImage: string = '';
  ingredientImages: string[] = [];
  mode: 'create' | 'edit' | 'view' = 'create';
  recipeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialiser le formulaire
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      servings: [1, Validators.required],
      category: [''],
      ingredients: this.fb.array([]),
      steps: this.fb.array([])
    });

    // Lire les query params
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'create';
      this.recipeId = params['id'] || null;

      if ((this.mode === 'edit' || this.mode === 'view') && this.recipeId) {
        this.loadRecipe(this.recipeId);
      } else {
        // Ajouter un ingrédient et une étape par défaut
        this.addIngredient();
        this.addStep();
      }
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  isCreateMode(): boolean {
    return this.mode === 'create';
  }

  isEditMode(): boolean {
    return this.mode === 'edit';
  }

  isViewMode(): boolean {
    return this.mode === 'view';
  }

  addIngredient(): void {
    this.ingredients.push(
      this.fb.group({
        name: [''],
        quantity: [''],
        unit: ['']
      })
    );
    this.ingredientImages.push('');
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
    this.ingredientImages.splice(index, 1);
  }

  addStep(): void {
    this.steps.push(this.fb.control(''));
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.recipeImage = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onIngredientImageSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.ingredientImages[index] = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  loadRecipe(id: string): void {
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const recipe = recipes.find((r: any) => r.id === id);
    if (!recipe) return;

    this.recipeForm.patchValue(recipe);
    this.recipeImage = recipe.image || '';

    // Reconstituer les ingrédients
    const ingArray = this.fb.array(
      recipe.ingredients.map((ing: any) =>
        this.fb.group({
          name: [ing.name],
          quantity: [ing.quantity],
          unit: [ing.unit]
        })
      )
    );
    this.recipeForm.setControl('ingredients', ingArray);
    this.ingredientImages = recipe.ingredients.map((ing: any) => ing.image || '');

    // Reconstituer les étapes
    const stepArray = this.fb.array(
      recipe.steps.map((step: string) => this.fb.control(step))
    );
    this.recipeForm.setControl('steps', stepArray);
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) return;

    const formValue = this.recipeForm.value;
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');

    const enrichedIngredients = formValue.ingredients.map((i: any, idx: number) => ({
      ...i,
      image: this.ingredientImages[idx] || ''
    }));

    if (this.isEditMode() && this.recipeId) {
      const index = recipes.findIndex((r: any) => r.id === this.recipeId);
      if (index !== -1) {
        recipes[index] = {
          ...formValue,
          id: this.recipeId,
          image: this.recipeImage,
          ingredients: enrichedIngredients
        };
      }
    } else {
      const newRecipe = {
        ...formValue,
        id: Date.now().toString(),
        image: this.recipeImage,
        ingredients: enrichedIngredients,
        likes: 0
      };
      recipes.push(newRecipe);
    }

    localStorage.setItem('recipes', JSON.stringify(recipes));
    this.router.navigate(['/home']);
  }
}