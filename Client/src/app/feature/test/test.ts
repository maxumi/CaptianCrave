import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-test',
  imports: [CommonModule, TranslocoModule],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class TestComponent {
  private http = inject(HttpClient);

  data = signal<unknown>(null);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/sample`).subscribe({
      next: result => {
        this.data.set(result);
        console.log(result);
      },
      error: error => {
        this.error.set('Could not fetch data');
        console.error('API error:', error);
      }
    });
  }
}