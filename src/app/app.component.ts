import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserStorageService } from './core/services/browser-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorageService);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.document.body.classList.toggle('dark-theme', this.storage.get('dark-mode', false));
  }
}
