import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-meal-planner',
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
  ],
})
export class MealPlannerComponent implements OnInit {
  createdRecipes: { title: string }[] = [];

  days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  times: string[] = ['Midi', 'Soir'];

  meals: any = {};

  ngOnInit(): void {
    this.loadRecipesFromLocalStorage();
    this.initMeals();
  }

  loadRecipesFromLocalStorage(): void {
    const data = localStorage.getItem('recipes');
    try {
      const parsed = JSON.parse(data || '[]');
      this.createdRecipes = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Erreur de parsing des recettes :', e);
      this.createdRecipes = [];
    }
  }

  initMeals(): void {
    for (let day of this.days) {
      this.meals[day] = {};
      for (let time of this.times) {
        this.meals[day][time] = {
          entree: '',
          plat: '',
          dessert: '',
        };
      }
    }
  }

  printPlanner(): void {
    window.print();
  }
}