import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class ProfilePageComponent {
  profileForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      firstname: [''],
      lastname: [''],
      email: [''],
      password: [''],
      newPassword: ['']
    });

    this.loadUserData();
  }

  loadUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      this.profileForm.patchValue({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || ''
      });
    }
  }

  saveChanges() {
    const updatedUser = {
      ...JSON.parse(localStorage.getItem('user') || '{}'),
      ...this.profileForm.value
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Modifications enregistrées.');
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/auth-page']);
  }
}