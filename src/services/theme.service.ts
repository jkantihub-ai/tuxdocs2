
import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false); // Default to Light Mode

  constructor() {
    effect(() => {
      const root = document.documentElement;
      if (this.isDark()) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    });
  }

  toggle() {
    this.isDark.update(d => !d);
  }
}
