
import { Component, input, signal, effect, inject, ElementRef, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { parse } from 'marked';
import { GeminiService } from '../../services/gemini.service';
import { Doc } from '../../services/doc.service';
import { Chat } from '@google/genai';
import { ThemeService } from '../../services/theme.service';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  html?: SafeHtml; // Pre-render HTML for performance
}

@Component({
  selector: 'app-doc-chat-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Toggle Button (visible when closed) -->
    @if (!isOpen()) {
      <button (click)="toggle()" 
              class="fixed bottom-6 right-6 z-40 bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-lg shadow-orange-900/20 transition-all hover:scale-105 flex items-center justify-center animate-in fade-in zoom-in">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    }

    <!-- Chat Sidebar -->
    <div class="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
         [class.translate-x-0]="isOpen()"
         [class.translate-x-full]="!isOpen()">
      
      <!-- Header -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1e293b]">
        <div>
          <h3 class="font-bold text-slate-800 dark:text-white text-sm">Doc Assistant</h3>
          <p class="text-[10px] text-orange-600 dark:text-orange-400 font-mono truncate max-w-[200px]">CONTEXT: {{ currentDoc()?.title || 'None' }}</p>
          @if (viewMode() === 'modern') {
             <span class="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800">MODERN MODE</span>
          }
        </div>
        <button (click)="toggle()" class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" #scrollContainer>
        @if (messages().length === 0) {
          <div class="text-center mt-10 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-2">👋 Hi! I'm reading this doc with you.</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Ask me to translate legacy commands or explain complex flags.</p>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div class="flex flex-col" [class.items-end]="msg.role === 'user'" [class.items-start]="msg.role === 'model'">
            <div class="max-w-[90%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm overflow-hidden"
                 [class.bg-orange-600]="msg.role === 'user'"
                 [class.text-white]="msg.role === 'user'"
                 [class.bg-slate-100]="msg.role === 'model'"
                 [class.dark:bg-slate-800]="msg.role === 'model'"
                 [class.text-slate-800]="msg.role === 'model'"
                 [class.dark:text-slate-200]="msg.role === 'model'"
                 [class.border]="msg.role === 'model'"
                 [class.border-slate-200]="msg.role === 'model'"
                 [class.dark:border-slate-700]="msg.role === 'model'">
               
               @if (msg.role === 'user') {
                 <div class="whitespace-pre-wrap">{{ msg.text }}</div>
               } @else {
                 <div class="markdown-body text-xs prose dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-pre:p-2 prose-pre:bg-white dark:prose-pre:bg-slate-900" [innerHTML]="msg.html"></div>
               }

            </div>
            <span class="text-[10px] text-slate-400 dark:text-slate-600 mt-1 mx-1">{{ msg.role === 'user' ? 'You' : 'Gemini' }}</span>
          </div>
        }
        
        @if (isThinking()) {
           <div class="flex justify-start">
             <div class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 flex space-x-1 items-center">
               <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
               <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-75"></div>
               <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a]">
        <div class="relative">
          <textarea 
            #messageInput
            class="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl pl-3 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 border border-slate-300 dark:border-slate-700 resize-none h-12"
            placeholder="Ask about this doc..."
            (keydown.enter)="sendMessage($event)"></textarea>
          
          <button (click)="sendMessage(null)"
                  [disabled]="isThinking()" 
                  class="absolute right-2 top-2 p-1.5 bg-orange-600 rounded-lg text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DocChatAssistantComponent {
  currentDoc = input<Doc | null>(null);
  viewMode = input<'original' | 'modern'>('original');
  modernContent = input<string | null>(null);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  isThinking = signal(false);

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);
  public themeService = inject(ThemeService);
  private chatSession: Chat | null = null;

  constructor() {
    effect(() => {
      const doc = this.currentDoc();
      const mode = this.viewMode();
      const content = this.modernContent();
      
      if (doc) {
        this.resetChat(doc, mode, content);
      }
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  resetChat(doc: Doc, mode: 'original' | 'modern', content: string | null) {
    this.chatSession = this.geminiService.createChatSession(doc, mode, content);
    this.messages.set([]);
  }

  async sendMessage(event: Event | null) {
    if (event instanceof KeyboardEvent) {
       if (event.key === 'Enter' && !event.shiftKey) {
         event.preventDefault(); 
       } else {
         return;
       }
    }

    const inputEl = this.messageInput.nativeElement;
    const text = inputEl.value.trim();
    if (!text || !this.chatSession) return;

    inputEl.value = '';
    
    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.scrollToBottom();
    this.isThinking.set(true);

    try {
      const result = await this.chatSession.sendMessage(text);
      const responseText = result.text;
      const responseHtml = this.sanitizer.bypassSecurityTrustHtml(parse(responseText) as string);
      
      this.messages.update(msgs => [...msgs, { 
        role: 'model', 
        text: responseText,
        html: responseHtml
      }]);
    } catch (e) {
      this.messages.update(msgs => [...msgs, { role: 'model', text: 'Error connecting to Gemini.' }]);
    } finally {
      this.isThinking.set(false);
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer?.nativeElement) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
