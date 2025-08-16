import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatCheckboxModule
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);

  isRegister = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  registerForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  hideLoginPassword = true;
  hidePassword = true;
  hideConfirmPassword = true;

  successMessage = '';
  errorMessage = '';

  uppercaseRegex = /[A-Z]/g;
  digitRegex = /[0-9]/g;
  specialCharRegex = /[^a-zA-Z0-9]/g;

  toggleMode() {
    this.isRegister.update(v => !v);
    this.successMessage = '';
    this.errorMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  isRegisterMode() {
    return this.isRegister();
  }

  password(): string {
    return this.registerForm.value.password || '';
  }

  passwordStrength(): number {
    const pwd = this.password();
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if ((pwd.match(this.uppercaseRegex) || []).length >= 2) strength++;
    if ((pwd.match(this.digitRegex) || []).length >= 5) strength++;
    if ((pwd.match(this.specialCharRegex) || []).length >= 1) strength++;
    return strength;
  }

  onLogin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const email = this.loginForm.value.email?.trim();
    const password = this.loginForm.value.password;

    const user = users.find((u: any) =>
      u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify({ email: user.email }));
      if (this.loginForm.value.remember && email) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      this.router.navigateByUrl('/home');
    } else {
      this.errorMessage = 'Email ou mot de passe incorrect.';
      this.successMessage = '';
    }
  }

  onRegister() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const { firstname, lastname, email, password, confirmPassword } = this.registerForm.value;

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      this.successMessage = '';
      return;
    }

    const normalizedEmail = email.trim();
    if (users.find((u: any) => u.email === normalizedEmail)) {
      this.errorMessage = 'Email déjà utilisé.';
      this.successMessage = '';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      this.successMessage = '';
      return;
    }

    const newUser = { firstname, lastname, email: normalizedEmail, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userProfile', JSON.stringify(newUser));
    localStorage.setItem('user', JSON.stringify({ email: normalizedEmail }));

    this.successMessage = 'Inscription réussie.';
    this.errorMessage = '';

    setTimeout(() => {
      this.router.navigateByUrl('/home-page');
    }, 1000);
  }

  ngOnInit(): void {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      this.loginForm.patchValue({ email: remembered, remember: true });
    }
  }
}