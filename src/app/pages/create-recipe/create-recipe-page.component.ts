import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

// ⤵️ Ajuste ces chemins selon ta structure
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

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
  category: Category | string;
  image?: string | null;           // base64
  ingredientImages?: (string | null)[]; // base64 par ingrédient
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
  ],
})
export class CreateRecipePageComponent {
  private platformId = inject(PLATFORM_ID);
  private fb         = inject(FormBuilder);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);

  // États d’UI / navigation
  mode = signal<'create' | 'edit' | 'view'>('create');
  currentId: number | null = null;

  // Images (base64)
  recipeImage: string | null = null;
  ingredientImages: (string | null)[] = [];

  // Formulaire principal
  recipeForm: FormGroup = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    servings:    [1,  [Validators.required, Validators.min(1)]],
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
      const raw = localStorage.getItem(LS_RECIPES_KEY);
      return raw ? (JSON.parse(raw) as RecipeModel[]) : [];
    } catch { return []; }
  }

  private writeRecipes(recipes: RecipeModel[]): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(LS_RECIPES_KEY, JSON.stringify(recipes));
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
    if (index < 0 || index >= this.ingredients.length) return;
    this.ingredients.removeAt(index);
    this.ingredientImages.splice(index, 1);
  }

  addStep(): void {
    this.steps.push(new FormControl('', { nonNullable: true }));
  }

  removeStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.steps.removeAt(index);
  }

  /* --------------------------------- Images ------------------------------------ */
  async onImageSelected(event: Event): Promise<void> {
    if (this.isViewMode()) return;
    const file = this.extractFirstFile(event);
    if (!file) return;
    this.recipeImage = await this.fileToBase64(file);
  }

  async onIngredientImageSelected(event: Event, index: number): Promise<void> {
    if (this.isViewMode()) return;
    const file = this.extractFirstFile(event);
    if (!file) return;
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
    // Simple générateur basé sur le temps + aléatoire pour limiter les collisions locales
    return Date.now() + Math.floor(Math.random() * 1_000);
  }
}