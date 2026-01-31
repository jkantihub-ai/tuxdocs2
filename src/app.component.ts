
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiSearchBarComponent } from './components/ai-search-bar/ai-search-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AiSearchBarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
