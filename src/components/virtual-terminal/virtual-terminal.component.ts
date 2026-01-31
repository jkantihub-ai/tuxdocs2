
import { Component, ElementRef, inject, signal, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
  cwd?: string;
}

@Component({
  selector: 'app-virtual-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-[#0c0c0c] text-slate-900 dark:text-orange-500 font-mono flex flex-col p-4 md:p-8 transition-colors duration-300">
      
      <!-- Terminal Container (Always Dark) -->
      <div class="bg-[#0c0c0c] rounded-xl shadow-2xl border border-slate-300 dark:border-orange-900/30 flex-1 flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
        <!-- Header -->
        <div class="flex justify-between items-center px-4 py-3 border-b border-orange-900/30 bg-[#151515]">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-4 text-sm text-orange-400 opacity-70">root@gemini-linux:~</span>
          </div>
          <button (click)="exit()" class="text-orange-700 hover:text-orange-500 text-sm font-bold uppercase tracking-widest">[ Exit Simulation ]</button>
        </div>

        <!-- Terminal Output -->
        <div class="flex-1 overflow-y-auto space-y-1 p-4 scrollbar-hide bg-[#0c0c0c]" #scrollContainer (click)="focusInput()">
          <div class="text-orange-300 opacity-50 mb-4">
            Welcome to Gemini Linux 24.04 LTS (GNU/Linux 6.5.0-generic x86_64)<br>
            * Documentation:  https://help.ubuntu.com<br>
            * Management:     https://landscape.canonical.com<br>
            <br>
            System information as of {{ today | date:'medium' }}<br>
            <br>
            <span class="text-orange-500">⚠ This is an AI Simulation. Files are ephemeral. Do not paste real secrets.</span>
          </div>

          @for (line of history(); track $index) {
            @if (line.type === 'input') {
              <div class="flex gap-2 text-white">
                <span class="text-green-500">root@gemini:</span>
                <span class="text-blue-400">{{ line.cwd || '~' }}$</span>
                <span>{{ line.content }}</span>
              </div>
            } @else {
              <div class="whitespace-pre-wrap text-orange-200 opacity-90 pl-2 border-l-2 border-orange-900/20 mb-2">{{ line.content }}</div>
            }
          }
          
          @if (isProcessing()) {
             <div class="animate-pulse text-orange-500">_</div>
          }
        </div>

        <!-- Input Line -->
        <div class="flex gap-2 items-center bg-[#1a1a1a] p-3 border-t border-orange-900/30">
          <span class="text-green-500 font-bold">root@gemini:</span>
          <span class="text-blue-400 font-bold">{{ cwd() }}$</span>
          <input 
            #cmdInput
            type="text" 
            [(ngModel)]="currentCommand"
            (keydown.enter)="execute()"
            class="flex-1 bg-transparent border-none outline-none text-white font-bold placeholder-gray-700"
            placeholder="apt-get update..."
            [disabled]="isProcessing()"
            autofocus
          >
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class VirtualTerminalComponent implements AfterViewChecked {
  history = signal<TerminalLine[]>([]);
  currentCommand = '';
  cwd = signal('~');
  isProcessing = signal(false);
  today = new Date();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('cmdInput') cmdInput!: ElementRef;

  private geminiService = inject(GeminiService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  focusInput() {
    this.cmdInput.nativeElement.focus();
  }

  exit() {
    this.router.navigate(['/']);
  }

  async execute() {
    const cmd = this.currentCommand.trim();
    if (!cmd) return;

    this.history.update(h => [...h, { type: 'input', content: cmd, cwd: this.cwd() }]);
    this.currentCommand = '';
    this.isProcessing.set(true);

    if (cmd === 'clear') {
      this.history.set([]);
      this.isProcessing.set(false);
      return;
    }

    const result = await this.geminiService.simulateTerminal(
      this.history().map(l => `${l.type === 'input' ? '>' : ''} ${l.content}`),
      cmd,
      this.cwd()
    );

    if (result.output) {
      this.history.update(h => [...h, { type: 'output', content: result.output }]);
    }
    
    if (result.newCwd) {
      this.cwd.set(result.newCwd);
    } else if (cmd.startsWith('cd ')) {
      const args = cmd.split(' ')[1];
      if (args) this.cwd.set(args);
    }

    this.isProcessing.set(false);
  }
}
