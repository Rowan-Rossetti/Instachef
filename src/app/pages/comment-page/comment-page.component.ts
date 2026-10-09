import { Component, Input, OnChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { BrowserStorageService } from '../../core/services/browser-storage.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment-page',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
],
  templateUrl: './comment-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./comment-page.component.scss']
})
export class CommentPageComponent implements OnChanges {
  private readonly storage = inject(BrowserStorageService);
  @Input() recipeId!: string;

  comments: { content: string; date: string }[] = [];
  newComment = '';

  ngOnChanges(): void {
    this.newComment = '';
    this.loadComments();
  }

  loadComments(): void {
    this.comments = this.storage.getArray<{ content: string; date: string }>(
      `comments_${this.recipeId}`,
      (comment): comment is { content: string; date: string } =>
        !!comment && typeof comment === 'object' && 'content' in comment &&
        typeof comment.content === 'string' && 'date' in comment && typeof comment.date === 'string',
    );
  }

  saveComments(): void {
    this.storage.set(`comments_${this.recipeId}`, this.comments);
  }

  postComment(): void {
    if (this.newComment.trim()) {
      this.comments.push({
        content: this.newComment.trim(),
        date: new Date().toLocaleString()
      });
      this.newComment = '';
      this.saveComments();
    }
  }

  deleteComment(index: number): void {
    this.comments.splice(index, 1);
    this.saveComments();
  }
}
