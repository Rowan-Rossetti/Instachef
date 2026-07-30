import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from '../../components/header/header.component';
import { BrowserStorageService } from '../../core/services/browser-storage.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommentPageComponent } from '../comment-page/comment-page.component';

type Category = 'entrée' | 'plat' | 'dessert' | '';

interface IngredientForm {
  name: string;
  quantity: number | null;
  unit: string;
}

export interface RecipeModel {
  id: number;
  title: string;
  description: string;
  servings: number;
  prepTime?: number;
  difficulty?: 'facile' | 'intermédiaire' | 'avancé' | '';
  category: Category | string;
  image?: string | null;
  ingredientImages?: (string | null)[];
  ingredients: IngredientForm[];
  steps: string[];
}

const LS_RECIPES_KEY = 'recipes';

@Component({
  selector: 'app-create-recipe-page',
  standalone: true,
  templateUrl: './create-recipe-page.component.html',
  styleUrl: './create-recipe-page.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,

    // Custom
    HeaderComponent,
    FooterComponent,
    CommentPageComponent,
  ],
})
export class CreateRecipePageComponent {
  private platformId = inject(PLATFORM_ID);
  private fb         = inject(FormBuilder);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private storage    = inject(BrowserStorageService);

  mode = signal<'create' | 'edit' | 'view'>('create');
  currentId: number | null = null;

  // Images
  recipeImage: string | null = null;
  ingredientImages: (string | null)[] = [];
  feedbackMessage = '';
  fileError = '';

  // Formulaire principal
  recipeForm: FormGroup = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(5)]], 
    servings:    [1,  [Validators.required, Validators.min(1), Validators.max(50)]],
    prepTime:    [30, [Validators.required, Validators.min(1), Validators.max(1440)]],
    difficulty:  ['facile'],
    category:    [''  as Category, Validators.required],
    ingredients: this.fb.array([]),
    steps:       this.fb.array([]),
  });

  /* --------------------------------- Lifecycle --------------------------------- */
  constructor() {
    // Lire les query params pour déterminer le mode + id
    this.route.queryParamMap.subscribe((params) => {
      const mode = (params.get('mode') as 'create' | 'edit' | 'view' | null) ?? 'create';
      const id   = params.get('id');

      this.mode.set(mode);
      this.currentId = id ? Number(id) : null;

      if (this.isEditMode() || this.isViewMode()) {
        this.loadRecipeForEditOrView(this.currentId);
      } else {
        // Créer un “squelette” propre
        if (this.ingredients.length === 0) this.addIngredient();
        if (this.steps.length === 0) this.addStep();
      }

      this.updateFormEnablement();
    });
  }

  /* --------------------------------- Getters ----------------------------------- */
  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.get('ingredients') as FormArray<FormGroup>;
  }

  get steps(): FormArray<FormControl<string>> {
    return this.recipeForm.get('steps') as FormArray<FormControl<string>>;
  }

  /* ------------------------------ Mode helpers --------------------------------- */
  isCreateMode(): boolean { return this.mode() === 'create'; }
  isEditMode(): boolean   { return this.mode() === 'edit'; }
  isViewMode(): boolean   { return this.mode() === 'view'; }

  get pageTitle(): string {
    if (this.isEditMode()) return 'Peaufinez votre recette';
    if (this.isViewMode()) return 'Découvrez la recette';
    return 'Créez une nouvelle recette';
  }

  get pageSubtitle(): string {
    if (this.isEditMode()) return 'Ajustez les détails, les ingrédients et les étapes avant de republier.';
    if (this.isViewMode()) return 'Tous les détails nécessaires pour réussir ce plat.';
    return 'Transformez votre idée en une fiche claire, gourmande et facile à suivre.';
  }

  get completionPercentage(): number {
    const value = this.recipeForm.getRawValue();
    const checks = [
      !!value.title?.trim(),
      !!value.description?.trim(),
      Number(value.servings) > 0,
      Number(value.prepTime) > 0,
      !!value.difficulty,
      !!value.category,
      this.ingredients.length > 0 && this.ingredients.controls.every(item => !!item.get('name')?.value?.trim()),
      this.steps.length > 0 && this.steps.controls.every(step => !!step.value?.trim()),
      !!this.recipeImage
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private updateFormEnablement(): void {
    if (this.isViewMode()) {
      this.recipeForm.disable({ emitEvent: false });
    } else {
      this.recipeForm.enable({ emitEvent: false });
    }
  }

  /* ------------------------------- LocalStorage -------------------------------- */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readRecipes(): RecipeModel[] {
    if (!this.isBrowser) return [];
    try {
      return this.storage.get<RecipeModel[]>(LS_RECIPES_KEY, []);
    } catch { return []; }
  }

  private writeRecipes(recipes: RecipeModel[]): void {
    if (!this.isBrowser) return;
    try {
      this.storage.set(LS_RECIPES_KEY, recipes);
    } catch { /* noop */ }
  }

  /* ---------------------------------- Load ------------------------------------- */
  private loadRecipeForEditOrView(id: number | null): void {
    if (id == null) return;
    const all = this.readRecipes();
    const found = all.find(r => r.id === id);
    if (!found) return;

    // Patch form
    this.recipeForm.patchValue({
      title:       found.title ?? '',
      description: found.description ?? '',
      servings:    typeof found.servings === 'number' && found.servings > 0 ? found.servings : 1,
      prepTime:    typeof found.prepTime === 'number' && found.prepTime > 0 ? found.prepTime : 30,
      difficulty:  found.difficulty ?? 'facile',
      category:    (found.category as Category) ?? '',
    });

    // Image principale
    this.recipeImage = found.image ?? null;

    // Ingrédients + images
    this.ingredients.clear();
    this.ingredientImages = [];
    (found.ingredients ?? []).forEach((ing, i) => {
      this.ingredients.push(this.fb.group({
        name:     [ing?.name ?? '', Validators.required],
        quantity: [typeof ing?.quantity === 'number' ? ing.quantity : null],
        unit:     [ing?.unit ?? ''],
      }));
      this.ingredientImages[i] = found.ingredientImages?.[i] ?? null;
    });

    // Étapes
    this.steps.clear();
    (found.steps ?? []).forEach(step => this.steps.push(new FormControl(step ?? '', { nonNullable: true })));

    if (this.ingredients.length === 0) this.addIngredient();
    if (this.steps.length === 0) this.addStep();
  }

  /* --------------------------------- Actions ----------------------------------- */
  async onSubmit(): Promise<void> {
    if (this.isViewMode()) return;

    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formValue = this.recipeForm.getRawValue();

    const toSave: RecipeModel = {
      id: this.isCreateMode() ? this.generateId() : (this.currentId ?? this.generateId()),
      title:       formValue.title,
      description: formValue.description,
      servings:    formValue.servings,
      prepTime:    formValue.prepTime,
      difficulty:  formValue.difficulty,
      category:    formValue.category,
      image:       this.recipeImage,
      ingredientImages: this.ingredientImages.map(v => v ?? null),
      ingredients: formValue.ingredients as IngredientForm[],
      steps:       (formValue.steps as string[]).map(s => s ?? ''),
    };

    const all = this.readRecipes();

    if (this.isCreateMode()) {
      all.push(toSave);
    } else {
      const idx = all.findIndex(r => r.id === toSave.id);
      if (idx >= 0) all[idx] = toSave; else all.push(toSave);
    }

    this.writeRecipes(all);
    this.feedbackMessage = this.isEditMode() ? 'Modifications enregistrées.' : 'Recette publiée.';

    // Redirection vers la page d’accueil (ajuste la route au besoin)
    this.router.navigate(['/home']);
  }

  addIngredient(): void {
    this.ingredients.push(
      this.fb.group({
        name:     ['', Validators.required],
        quantity: [null],
        unit:     [''],
      })
    );
    this.ingredientImages.push(null);
  }

  removeIngredient(index: number): void {
    if (index < 0 || index >= this.ingredients.length || this.ingredients.length === 1) return;
    this.ingredients.removeAt(index);
    this.ingredientImages.splice(index, 1);
  }

  addStep(): void {
    this.steps.push(new FormControl('', { nonNullable: true }));
  }

  removeStep(index: number): void {
    if (index < 0 || index >= this.steps.length || this.steps.length === 1) return;
    this.steps.removeAt(index);
  }

  /* --------------------------------- Images ------------------------------------ */
  async onImageSelected(event: Event): Promise<void> {
    if (this.isViewMode()) return;
    const file = this.extractFirstFile(event);
    if (!file || !this.validateImage(file)) return;
    this.recipeImage = await this.fileToBase64(file);
  }

  async onIngredientImageSelected(event: Event, index: number): Promise<void> {
    if (this.isViewMode()) return;
    const file = this.extractFirstFile(event);
    if (!file || !this.validateImage(file)) return;
    const base64 = await this.fileToBase64(file);
    this.ensureIngredientImageIndex(index);
    this.ingredientImages[index] = base64;
  }

  /* ------------------------------- Utils fichiers ------------------------------ */
  private extractFirstFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    return file ?? null;
  }

  removeRecipeImage(): void { this.recipeImage = null; this.fileError = ''; }

  private validateImage(file: File): boolean {
    this.fileError = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.fileError = 'Format non pris en charge. Utilisez JPG, PNG ou WEBP.';
      return false;
    }
    if (file.size > 3 * 1024 * 1024) {
      this.fileError = 'L’image dépasse 3 Mo.';
      return false;
    }
    return true;
  }

  trackByIndex(index: number): number { return index; }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  private ensureIngredientImageIndex(index: number): void {
    while (this.ingredientImages.length <= index) this.ingredientImages.push(null);
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1_000);
  }
}