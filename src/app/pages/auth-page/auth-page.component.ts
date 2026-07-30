import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatCheckboxModule, MatProgressBarModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly isRegister = signal(false);
  readonly isSubmitting = signal(false);
  hidePassword = true;
  hideConfirmPassword = true;
  hideLoginPassword = true;
  successMessage = '';
  errorMessage = '';

  readonly uppercaseRegex = /[A-Z]/g;
  readonly digitRegex = /[0-9]/g;
  readonly specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  readonly registerForm = this.fb.nonNullable.group({
    firstname: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  isRegisterMode(): boolean { return this.isRegister(); }

  toggleMode(): void {
    this.isRegister.update(value => !value);
    this.successMessage = '';
    this.errorMessage = '';
  }

  password(): string { return this.registerForm.controls.password.value; }

  passwordStrength(): number {
    const password = this.password();
    return [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), this.specialCharRegex.test(password)].filter(Boolean).length;
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const value = this.registerForm.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage = '';
    try {
      await this.auth.register(value);
      await this.router.navigate(['/home']);
    } catch {
      this.errorMessage = "La création du compte a échoué. Vérifiez que le stockage du navigateur est autorisé.";
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage = '';
    const value = this.loginForm.getRawValue();
    try {
      const valid = await this.auth.login(value.email, value.password, value.remember);
      if (valid) await this.router.navigate(['/home']);
      else this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
