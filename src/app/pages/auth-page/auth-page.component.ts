import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/* Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  hideLoginPassword = true;

  isRegister = signal(false);

  successMessage = '';
  errorMessage = '';

  uppercaseRegex = /[A-Z]/g;
  digitRegex = /[0-9]/g;
  specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;

  constructor(private fb: FormBuilder, private router: Router) {

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });

    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  isRegisterMode() {
    return this.isRegister();
  }

  toggleMode() {
    this.isRegister.set(!this.isRegister());
    this.successMessage = '';
    this.errorMessage = '';
  }

  password() {
    return this.registerForm.get('password')?.value || '';
  }

  passwordStrength(): number {
    let strength = 0;
    if (this.password().length >= 8) strength++;
    if ((this.password().match(this.uppercaseRegex)?.length || 0) >= 2) strength++;
    if ((this.password().match(this.digitRegex)?.length || 0) >= 5) strength++;
    if ((this.password().match(this.specialCharRegex)?.length || 0) >= 1) strength++;
    return strength;
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas.";
      return;
    }

    const user = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    localStorage.setItem('currentUser', JSON.stringify(user));

    this.router.navigate(['/home']);
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (
      storedUser.email === this.loginForm.value.email &&
      storedUser.password === this.loginForm.value.password
    ) {
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = "Email ou mot de passe incorrect.";
    }
  }
}