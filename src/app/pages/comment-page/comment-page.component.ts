import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss']
})
export class CommentPageComponent implements OnInit {
  @Input() recipeId!: string;

  comments: { content: string; date: string }[] = [];
  newComment = '';

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    const stored = localStorage.getItem(`comments_${this.recipeId}`);
    this.comments = stored ? JSON.parse(stored) : [];
  }

  saveComments(): void {
    localStorage.setItem(`comments_${this.recipeId}`, JSON.stringify(this.comments));
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
