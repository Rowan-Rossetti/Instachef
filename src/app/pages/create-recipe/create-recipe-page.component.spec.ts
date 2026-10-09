import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { convertToParamMap } from '@angular/router';
import { BrowserStorageService } from '../../core/services/browser-storage.service';
import { CreateRecipePageComponent } from './create-recipe-page.component';

describe('Recipe saving', () => {
  it('keeps the form and shows an error when storage is full', async () => {
    const navigate = vi.fn();
    TestBed.configureTestingModule({ providers: [
      { provide: Router, useValue: { navigate } },
      { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
    ] });
    const component = TestBed.runInInjectionContext(() => new CreateRecipePageComponent());
    const storage = TestBed.inject(BrowserStorageService);
    vi.spyOn(storage, 'set').mockReturnValue(false);
    component.recipeForm.patchValue({ title: 'Recette test', description: 'Description test', category: 'plat' });
    component.ingredients.at(0).patchValue({ name: 'Riz' });
    component.steps.at(0).setValue('Cuire le riz');
    await component.onSubmit();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.feedbackMessage).toContain('n’a pas été enregistrée');
    expect(component.recipeForm.get('title')?.value).toBe('Recette test');
    vi.restoreAllMocks();
  });
});
