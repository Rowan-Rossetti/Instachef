import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

/* Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/* Tes composants */
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  profileForm!: FormGroup;

  hideCurrentPassword = true;
  hideNewPassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.profileForm = this.fb.group({
      firstname: [storedUser.firstname || ''],
      lastname: [storedUser.lastname || ''],
      email: [storedUser.email || ''],
      password: [storedUser.password || ''],
      newPassword: ['']
    });
  }

  saveChanges(): void {

    const formValue = this.profileForm.value;

    const updatedUser = {
      ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
      firstname: formValue.firstname,
      lastname: formValue.lastname,
      email: formValue.email,
      password: formValue.newPassword
        ? formValue.newPassword
        : formValue.password
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth']);
  }
}