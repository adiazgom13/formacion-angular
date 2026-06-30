import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // signal exposed to template
  readonly user = this.auth.user;

  constructor() {
    // Bootstrap auth state so navbar shows the right action after refresh/reload.
    this.auth.me().subscribe();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.router.navigate(['/home']),
    });
  }
}
