
import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  private readonly destroyRef = inject(DestroyRef);
  private savedTimer?: ReturnType<typeof setTimeout>;
  readonly saved = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.savedTimer));
  }
  hideNewPassword = true;
  readonly profileForm = this.fb.nonNullable.group({
    firstname: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', Validators.minLength(8)]
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) this.profileForm.patchValue(user);
  }

  async saveChanges(): Promise<void> {
    if (this.saving()) return;
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saved.set(false);
    this.error.set('');
    clearTimeout(this.savedTimer);
    try {
      await this.auth.updateProfile(this.profileForm.getRawValue());
      this.saved.set(true);
      this.profileForm.controls.newPassword.reset('');
      this.savedTimer = setTimeout(() => this.saved.set(false), 2500);
    } catch {
      this.error.set('Les modifications n’ont pas été enregistrées. Vérifiez le stockage du navigateur.');
    } finally {
      this.saving.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/auth']);
  }
}
