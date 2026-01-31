
import { Component, HostListener, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeminiService } from '../../services/gemini.service';
import { DocService, Doc } from '../../services/doc.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-ai-search-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm transition-all"
           (click)="close()">
        
        <div class="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
             (click)="$event.stopPropagation()">
          
          <!-- Input Area -->
          <div class="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b]/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              #searchInput
              type="text" 
              class="w-full bg-transparent text-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              placeholder="Ask Modern TLDP (e.g., 'How to block ip with firewall')..."
              [value]="query()"
              (input)="onInput($event)"
              (keydown.enter)="performSearch()"
            />
            <div class="flex gap-2">
              <span class="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">ESC</span>
            </div>
          </div>

          <!-- Results or Loading -->
          <div class="max-h-[60vh] overflow-y-auto p-2">
            
            @if (isLoading()) {
              <div class="p-8 text-center text-slate-400">
                <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2 text-orange-500"></div>
                <p>Gemini is finding relevant docs...</p>
              </div>
            }

            @if (!isLoading() && results().length === 0 && hasSearched()) {
              <div class="p-8 text-center text-slate-500">
                <p>No documents found matching that query.</p>
              </div>
            }

            @if (results().length > 0) {
              <div class="space-y-1">
                 <h3 class="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Suggested Docs</h3>
                 @for (doc of results(); track doc.id) {
                   <button (click)="navigateTo(doc)"
                           class="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group transition-colors flex items-start">
                     <div class="flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 dark:group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div class="ml-3">
                       <div class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-white">
                         {{ doc.title }}
                         @if (doc.obsolescenceScore > 80) {
                           <span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800">
                             LEGACY
                           </span>
                         }
                       </div>
                       <div class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ doc.description }}</div>
                     </div>
                   </button>
                 }
              </div>
            }
          </div>

          <div class="px-4 py-2 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>Semantic Search Active</span>
          </div>

        </div>
      </div>
    }
  `
})
export class AiSearchBarComponent {
  isOpen = signal(false);
  query = signal('');
  results = signal<Doc[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  private geminiService = inject(GeminiService);
  private docService = inject(DocService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  @ViewChild('searchInput') searchInput!: ElementRef;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
      }
    }
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }

  close() {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
    this.hasSearched.set(false);
  }

  onInput(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }

  async performSearch() {
    if (!this.query().trim()) return;
    
    this.isLoading.set(true);
    this.hasSearched.set(true);
    
    const allDocs = this.docService.getAllDocs();
    const resultIds = await this.geminiService.semanticSearch(this.query(), allDocs);
    
    const matchedDocs = resultIds
      .map(id => allDocs.find(d => d.id === id))
      .filter((d): d is Doc => !!d);

    this.results.set(matchedDocs);
    this.isLoading.set(false);
  }

  navigateTo(doc: Doc) {
    this.router.navigate(['/doc', doc.id]);
    this.close();
  }
}
