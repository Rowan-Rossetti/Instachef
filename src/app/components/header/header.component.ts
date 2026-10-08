
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  menuOpened = false;
  readonly user = this.auth.currentUser();

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/auth']);
  }
}
