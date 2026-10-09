import { TestBed } from '@angular/core/testing';
import { CommentPageComponent } from './comment-page.component';

describe('CommentPageComponent', () => {
  beforeEach(() => localStorage.clear());
  it('handles invalid saved comments and refreshes when the recipe changes', () => {
    const component = TestBed.runInInjectionContext(() => new CommentPageComponent());
    localStorage.setItem('comments_1', '{broken');
    component.recipeId = '1';
    component.ngOnChanges();
    expect(component.comments).toEqual([]);
    localStorage.setItem('comments_2', JSON.stringify([{ content: 'Bon plat', date: '09/10/2026' }, null]));
    component.recipeId = '2';
    component.newComment = 'Draft for the old recipe';
    component.ngOnChanges();
    expect(component.comments).toEqual([{ content: 'Bon plat', date: '09/10/2026' }]);
    expect(component.newComment).toBe('');
  });
});
