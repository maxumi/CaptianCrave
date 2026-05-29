import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, TranslocoModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  
  transLocoService = inject(TranslocoService);
  currentLang = signal(localStorage.getItem('lang') ?? 'en')

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.currentLang.set(lang);
    // use transloco service to change the language
    this.transLocoService.setActiveLang(lang);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
