import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, TranslocoModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  transLocoService = inject(TranslocoService);
  currentLang = signal(localStorage.getItem('lang') ?? 'en')

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.currentLang.set(lang);
    // use transloco service to change the language
    this.transLocoService.setActiveLang(lang);
  }
}
