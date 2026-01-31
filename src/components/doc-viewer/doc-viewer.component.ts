
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { parse } from 'marked';
import { DocService, Doc } from '../../services/doc.service';
import { GeminiService, WalkthroughStep } from '../../services/gemini.service';
import { ProposalService } from '../../services/proposal.service';
import { ThemeService } from '../../services/theme.service';
import { ObsolescenceWarningComponent } from '../obsolescence-warning/obsolescence-warning.component';
import { DocChatAssistantComponent } from '../doc-chat-assistant/doc-chat-assistant.component';

@Component({
  selector: 'app-doc-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, ObsolescenceWarningComponent, DocChatAssistantComponent],
  template: `
    <!-- Context Chat Assistant (Passes current view state) -->
    <app-doc-chat-assistant 
        [currentDoc]="doc()" 
        [viewMode]="viewMode()" 
        [modernContent]="modernContent()">
    </app-doc-chat-assistant>

    <div class="min-h-screen pb-20 bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      <!-- Navbar / Top Bar -->
      <nav class="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-colors duration-300">
        <div class="flex items-center space-x-3 cursor-pointer group" (click)="goHome()">
          <div class="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center font-bold text-white font-mono group-hover:scale-105 transition-transform shadow-lg shadow-orange-900/20">
            TL
          </div>
          <span class="font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Modern TLDP</span>
        </div>
        
        <div class="hidden md:flex items-center space-x-6">
           <a (click)="goToTerminal()" class="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors flex items-center gap-2">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             AI Terminal
           </a>
           <a (click)="goToModeration()" class="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors flex items-center gap-2">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             Community
           </a>
        </div>

        <div class="flex items-center space-x-4">
           <!-- Theme Toggle -->
           <button (click)="themeService.toggle()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
              @if (themeService.isDark()) {
                <!-- Sun Icon -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              } @else {
                <!-- Moon Icon -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
           </button>

           <!-- Search Trigger -->
           <button (click)="openSearch()" class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 transition-colors text-sm">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <span class="hidden md:inline">Search...</span>
             <span class="text-xs bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-400">⌘K</span>
           </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-10">
        @if (doc(); as currentDoc) {
          
          <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <!-- Walkthrough Overlay (Dark Mode Only usually, but let's fit it) -->
            @if (mode() === 'walkthrough') {
               <div class="fixed inset-0 z-50 bg-slate-50 dark:bg-[#020617] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                  <div class="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                     <div>
                       <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Interactive Walkthrough</h2>
                       <p class="text-slate-500 dark:text-slate-400 text-sm">{{ currentDoc.title }}</p>
                     </div>
                     <button (click)="setMode('read')" class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span>Exit</span>
                     </button>
                  </div>
                  <div class="flex-1 flex overflow-hidden">
                     <div class="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0f172a]/50 overflow-y-auto hidden md:block p-6 space-y-4">
                           @for(step of walkthroughSteps(); track $index) {
                             <div (click)="currentStepIndex.set($index)" 
                                  class="cursor-pointer transition-all duration-200"
                                  [class.opacity-50]="$index > currentStepIndex()"
                                  [class.opacity-100]="$index <= currentStepIndex()">
                               <div class="flex items-center gap-3">
                                 <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                      [class.bg-orange-600]="$index === currentStepIndex()"
                                      [class.text-white]="$index === currentStepIndex()"
                                      [class.bg-slate-300]="$index !== currentStepIndex()"
                                      [class.dark:bg-slate-800]="$index !== currentStepIndex()"
                                      [class.text-slate-600]="$index !== currentStepIndex()"
                                      [class.dark:text-slate-400]="$index !== currentStepIndex()">{{ $index + 1 }}</div>
                                 <span class="text-sm font-medium" 
                                       [class.text-orange-600]="$index === currentStepIndex()"
                                       [class.dark:text-orange-400]="$index === currentStepIndex()"
                                       [class.text-slate-600]="$index !== currentStepIndex()"
                                       [class.dark:text-slate-400]="$index !== currentStepIndex()">{{ step.title }}</span>
                               </div>
                             </div>
                           }
                     </div>
                     <div class="flex-1 overflow-y-auto p-8 md:p-12 flex justify-center bg-white dark:bg-transparent">
                        @if (walkthroughSteps()[currentStepIndex()]; as step) {
                          <div class="max-w-2xl w-full animate-in fade-in slide-in-from-right-4 duration-300" [key]="currentStepIndex()">
                             <span class="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold tracking-wide uppercase mb-6 border border-orange-200 dark:border-orange-800/50">Step {{ currentStepIndex() + 1 }} of {{ walkthroughSteps().length }}</span>
                             <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">{{ step.title }}</h1>
                             <div class="prose prose-lg text-slate-700 dark:text-slate-300 mb-8 leading-relaxed"><p>{{ step.explanation }}</p></div>
                             @if (step.command) {
                               <div class="bg-slate-900 dark:bg-black/50 border border-slate-700 rounded-xl overflow-hidden mb-8 shadow-2xl">
                                 <div class="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                                   <span class="text-xs font-mono text-slate-400">Terminal</span>
                                   <button (click)="copyCommand(step.command)" class="text-xs text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider">Copy</button>
                                 </div>
                                 <div class="p-6 font-mono text-orange-300 text-sm md:text-base overflow-x-auto whitespace-pre">$ {{ step.command }}</div>
                               </div>
                             }
                             <div class="mt-12 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-8">
                                <button (click)="prevStep()" [disabled]="currentStepIndex() === 0" class="px-6 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30">Previous</button>
                                @if (currentStepIndex() < walkthroughSteps().length - 1) {
                                  <button (click)="nextStep()" class="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-orange-900/20 transition-all hover:scale-105">Next Step</button>
                                } @else {
                                  <button (click)="setMode('read')" class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105">Finish</button>
                                }
                             </div>
                          </div>
                        }
                     </div>
                  </div>
               </div>
            }

            <!-- Proposal Editor Overlay -->
            @if (isEditing()) {
               <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                 <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                   <div class="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] flex justify-between items-center">
                     <h2 class="text-xl font-bold text-slate-900 dark:text-white">Propose Changes</h2>
                     <button (click)="isEditing.set(false)" class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
                   </div>
                   <div class="p-6">
                     <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Edit Markdown Content</label>
                     <textarea [(ngModel)]="proposalContent" rows="15" class="w-full bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none"></textarea>
                   </div>
                   <div class="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] flex justify-end gap-4">
                     <button (click)="isEditing.set(false)" class="px-6 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                     <button (click)="submitProposal()" class="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-900/20 transition-all">Submit Proposal</button>
                   </div>
                 </div>
               </div>
            }

            <header class="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <!-- Meta & Title -->
                <div class="lg:col-span-3">
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md border border-slate-300 dark:border-slate-700 font-semibold">{{ currentDoc.category }}</span>
                        <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-700 font-mono">Last Update: {{ currentDoc.lastUpdated }}</span>
                        @if (viewMode() === 'modern' || isSplitView()) {
                           <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-md border border-green-200 dark:border-green-800/50 font-bold flex items-center gap-1 animate-in fade-in">
                             <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                             Modernized by AI
                           </span>
                        }
                    </div>
                    
                    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{{ currentDoc.title }}</h1>
                    
                    <!-- Feature Actions -->
                    <div class="flex flex-wrap gap-3 mb-6">
                        <!-- Brief -->
                        <button (click)="generateSummary()" 
                                [disabled]="isSummarizing()"
                                class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-medium disabled:opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span>{{ isSummarizing() ? 'Generating...' : 'Executive Brief' }}</span>
                        </button>

                        <!-- Walkthrough -->
                        <button (click)="startWalkthrough()" 
                                [disabled]="isGeneratingWalkthrough()"
                                class="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 dark:shadow-orange-900/20 px-4 py-2 rounded-lg transition-all text-sm font-bold disabled:opacity-50 hover:scale-105">
                            @if (isGeneratingWalkthrough()) {
                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Generating Steps...</span>
                            } @else {
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Interactive Mode</span>
                            }
                        </button>
                        
                        <!-- Edit Button -->
                        <button (click)="openEditor()" class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-orange-600 dark:text-orange-400 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-medium">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          <span>Propose Edit</span>
                        </button>
                    </div>

                    <!-- Obsolescence Check & Modernize Action -->
                    @if (currentDoc.obsolescenceScore > 80) {
                        <app-obsolescence-warning 
                            [lastUpdated]="currentDoc.lastUpdated" 
                            [modernEquivalent]="currentDoc.modernEquivalent || 'Modern Linux Tools'">
                        </app-obsolescence-warning>
                        
                        @if (!modernContent()) {
                          <div class="mb-6">
                             <button (click)="modernizeContent()"
                                     [disabled]="isModernizing()" 
                                     class="w-full md:w-auto bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:border-amber-700/50 dark:text-amber-500 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                @if (isModernizing()) {
                                  <div class="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                                  <span>Rewriting Legacy Content...</span>
                                } @else {
                                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                  <span>Modernize Guide with AI</span>
                                }
                             </button>
                          </div>
                        }
                    }
                </div>

                <!-- Table of Contents -->
                <div class="hidden lg:block lg:col-span-1">
                    <div class="sticky top-24">
                        <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">On this page</h4>
                        <ul class="space-y-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                            @for(header of toc(); track header.id) {
                                <li>
                                    <a [href]="'#' + header.id" (click)="scrollTo(header.id, $event)" 
                                       class="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 block transition-colors truncate">
                                       {{ header.text }}
                                    </a>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </header>

            @if (modernContent()) {
              <div class="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-8">
                <!-- View Tabs -->
                <div class="flex space-x-6">
                  <button (click)="viewMode.set('original'); isSplitView.set(false)" class="pb-3 text-sm font-bold tracking-wide transition-all border-b-2" 
                      [class.text-slate-400]="viewMode() !== 'original' && !isSplitView()" 
                      [class.border-transparent]="viewMode() !== 'original' && !isSplitView()" 
                      [class.text-slate-900]="viewMode() === 'original' && !isSplitView()" 
                      [class.dark:text-white]="viewMode() === 'original' && !isSplitView()"
                      [class.border-slate-900]="viewMode() === 'original' && !isSplitView()"
                      [class.dark:border-white]="viewMode() === 'original' && !isSplitView()">
                      Legacy Original
                  </button>
                  <button (click)="viewMode.set('modern'); isSplitView.set(false)" class="pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2" 
                      [class.text-slate-400]="viewMode() !== 'modern' && !isSplitView()" 
                      [class.border-transparent]="viewMode() !== 'modern' && !isSplitView()" 
                      [class.text-green-600]="viewMode() === 'modern' && !isSplitView()" 
                      [class.dark:text-green-400]="viewMode() === 'modern' && !isSplitView()"
                      [class.border-green-600]="viewMode() === 'modern' && !isSplitView()"
                      [class.dark:border-green-400]="viewMode() === 'modern' && !isSplitView()">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 
                     Modernized (AI)
                  </button>
                </div>

                <!-- Split View Toggle -->
                <button (click)="isSplitView.set(!isSplitView())" 
                        class="mb-2 flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-colors"
                        [class.bg-orange-100]="isSplitView()"
                        [class.text-orange-700]="isSplitView()"
                        [class.border-orange-200]="isSplitView()"
                        [class.dark:bg-orange-900/30]="isSplitView()"
                        [class.dark:text-orange-400]="isSplitView()"
                        [class.dark:border-orange-800]="isSplitView()"
                        [class.bg-transparent]="!isSplitView()"
                        [class.text-slate-500]="!isSplitView()"
                        [class.border-slate-200]="!isSplitView()"
                        [class.dark:border-slate-800]="!isSplitView()">
                   <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                   Split View
                </button>
              </div>
            }

            @if (summary()) {
              <div class="mb-12 p-6 glass-panel rounded-xl animate-in fade-in slide-in-from-top-4 border-l-4 border-orange-500 shadow-xl shadow-orange-900/5">
                <div class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-orange-600 dark:prose-headings:text-orange-400 prose-headings:font-bold prose-headings:uppercase prose-headings:text-xs prose-headings:tracking-wider prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                  <div [innerHTML]="safeSummary()"></div>
                </div>
              </div>
            }
            
            <!-- Main Content Area: Supports Single or Split View -->
            <div [class.flex]="isSplitView()" [class.flex-col]="isSplitView()" [class.lg:flex-row]="isSplitView()" [class.gap-8]="isSplitView()">
              
              <!-- Original Content -->
              @if (isSplitView() || viewMode() === 'original') {
                <div [class.flex-1]="isSplitView()" [class.min-w-0]="isSplitView()" class="animate-in fade-in duration-300">
                   @if (isSplitView()) {
                     <div class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Legacy Documentation</div>
                   }
                   <article class="markdown-body min-h-[50vh] pb-20">
                      <div class="font-sans leading-relaxed" [innerHTML]="safeOriginalContent()"></div>
                   </article>
                </div>
              }

              <!-- Divider in Split View -->
              @if (isSplitView()) {
                <div class="hidden lg:block w-px bg-slate-200 dark:bg-slate-800"></div>
              }

              <!-- Modern Content -->
              @if (isSplitView() || viewMode() === 'modern') {
                 @if (modernContent()) {
                    <div [class.flex-1]="isSplitView()" [class.min-w-0]="isSplitView()" class="animate-in fade-in duration-300">
                       @if (isSplitView()) {
                         <div class="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Modernized by AI</div>
                       }
                       <article class="markdown-body min-h-[50vh] pb-20">
                          <div class="font-sans leading-relaxed" [innerHTML]="safeModernContent()"></div>
                       </article>
                    </div>
                 }
              }

            </div>

          </div>

        } @else {
           <div class="animate-in fade-in duration-700">
             <!-- Hero Section -->
             <div class="text-center mb-16 pt-10">
               <div class="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6 animate-bounce-slow shadow-sm">
                 <span class="text-4xl">🐧</span>
               </div>
               <h2 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">The Linux Documentation Project <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Reimagined for AI</span></h2>
               <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                 Access thousands of legacy and modern How-To guides. Use <span class="text-orange-600 dark:text-orange-400 font-mono">Cmd+K</span> to search naturally, 
                 simulate commands in the <span class="text-orange-600 dark:text-orange-400 font-bold">AI Terminal</span>, and contribute to the community.
               </p>
               
               <div class="mt-8 flex justify-center gap-4">
                  <button (click)="openSearch()" class="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-orange-600/20 dark:shadow-orange-900/20 flex items-center gap-2">
                    Find a Guide
                  </button>
                  <button (click)="goToTerminal()" class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-8 py-3 rounded-full font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                    Launch Terminal
                  </button>
               </div>
             </div>

             <!-- Document Grid -->
             <div>
               <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                 <svg class="w-5 h-5 text-orange-600 dark:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                 Latest How-Tos
               </h3>
               
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 @for (d of allDocs(); track d.id) {
                   <div (click)="viewDoc(d)" class="group cursor-pointer bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-700/50 rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/5 dark:hover:shadow-orange-900/10 flex flex-col h-full">
                     <div class="flex justify-between items-start mb-4">
                       <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors border border-slate-200 dark:border-slate-800">{{ d.category }}</span>
                       @if (d.obsolescenceScore > 80) { <span class="text-[10px] text-amber-700 dark:text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-900/50">Legacy</span> }
                     </div>
                     <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2 line-clamp-2">{{ d.title }}</h4>
                     <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 flex-grow">{{ d.description }}</p>
                     <div class="flex items-center text-xs text-slate-400 dark:text-slate-500 font-mono mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50"><span>Updated: {{ d.lastUpdated }}</span></div>
                   </div>
                 }
               </div>
             </div>
           </div>
        }
      </main>
    </div>
  `
})
export class DocViewerComponent {
  doc = signal<Doc | null>(null);
  modernContent = signal<string | null>(null);
  viewMode = signal<'original' | 'modern'>('original');
  isSplitView = signal(false);

  summary = signal<string>('');
  isSummarizing = signal(false);
  walkthroughSteps = signal<WalkthroughStep[]>([]);
  isGeneratingWalkthrough = signal(false);
  currentStepIndex = signal(0);
  isModernizing = signal(false);
  mode = signal<'read' | 'walkthrough'>('read');
  allDocs = signal<Doc[]>([]);

  // Editing State
  isEditing = signal(false);
  proposalContent = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private docService = inject(DocService);
  private geminiService = inject(GeminiService);
  private proposalService = inject(ProposalService);
  public themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);

  // Computed content for Original view
  safeOriginalContent = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const rawHtml = parse(d.content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });

  // Computed content for Modern view
  safeModernContent = computed(() => {
    const c = this.modernContent();
    if (!c) return '';
    const rawHtml = parse(c) as string;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });

  safeSummary = computed(() => {
    const raw = this.summary();
    if (!raw) return '';
    return this.sanitizer.bypassSecurityTrustHtml(parse(raw) as string);
  });

  toc = computed(() => {
     // If split view, show TOC for Modern since that's likely what they want to navigate, 
     // or fallback to Original if Modern not there.
     const contentToParse = (this.viewMode() === 'modern' || this.isSplitView()) && this.modernContent() 
        ? this.modernContent()! 
        : this.doc()?.content || '';

     const headers: { id: string, text: string }[] = [];
     const regex = /^##\s+(.*)$/gm;
     let match;
     while ((match = regex.exec(contentToParse)) !== null) {
        const text = match[1];
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        headers.push({ id, text });
     }
     return headers;
  });

  constructor() {
    this.allDocs.set(this.docService.getAllDocs());
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const found = this.docService.getDocById(id);
        if (found) {
          this.doc.set({ ...found });
          this.modernContent.set(null);
          this.viewMode.set('original');
          this.isSplitView.set(false);
          this.summary.set('');
          this.walkthroughSteps.set([]);
          this.mode.set('read');
          window.scrollTo(0,0);
        }
      } else {
        this.doc.set(null);
      }
    });
  }

  async generateSummary() {
    const d = this.doc();
    if (!d) return;
    const contentToSummarize = (this.viewMode() === 'modern' || this.isSplitView()) && this.modernContent() ? this.modernContent()! : d.content;
    this.isSummarizing.set(true);
    const result = await this.geminiService.summarize(contentToSummarize);
    this.summary.set(result);
    this.isSummarizing.set(false);
  }
  
  async startWalkthrough() {
    const d = this.doc();
    if (!d) return;
    const contentToWalkthrough = (this.viewMode() === 'modern' || this.isSplitView()) && this.modernContent() ? this.modernContent()! : d.content;
    this.isGeneratingWalkthrough.set(true);
    this.walkthroughSteps.set([]);
    const steps = await this.geminiService.generateWalkthrough(contentToWalkthrough);
    if (steps.length > 0) {
       this.walkthroughSteps.set(steps);
       this.currentStepIndex.set(0);
       this.mode.set('walkthrough');
    }
    this.isGeneratingWalkthrough.set(false);
  }

  async modernizeContent() {
    const d = this.doc();
    if (!d) return;
    this.isModernizing.set(true);
    const modernContent = await this.geminiService.modernizeDoc(d.content);
    this.modernContent.set(modernContent);
    this.viewMode.set('modern');
    this.isSplitView.set(true); // Auto-enable split view on generation
    this.isModernizing.set(false);
  }

  openEditor() {
    const d = this.doc();
    if (!d) return;
    this.proposalContent = (this.viewMode() === 'modern' || this.isSplitView()) && this.modernContent() ? this.modernContent()! : d.content;
    this.isEditing.set(true);
  }

  async submitProposal() {
    const d = this.doc();
    if (!d) return;
    
    const prop = this.proposalService.addProposal({
      docId: d.id,
      docTitle: d.title,
      originalContent: d.content,
      proposedContent: this.proposalContent,
      author: 'user_dev'
    });

    this.isEditing.set(false);
    this.router.navigate(['/moderation']);
    
    const analysis = await this.geminiService.analyzeProposal(prop.originalContent, prop.proposedContent);
    this.proposalService.updateProposal(prop.id, { analysis });
  }

  nextStep() { if (this.currentStepIndex() < this.walkthroughSteps().length - 1) this.currentStepIndex.update(i => i + 1); }
  prevStep() { if (this.currentStepIndex() > 0) this.currentStepIndex.update(i => i - 1); }
  setMode(m: 'read' | 'walkthrough') { this.mode.set(m); }
  copyCommand(cmd: string) { navigator.clipboard.writeText(cmd); }
  scrollTo(id: string, event: Event) { event.preventDefault(); Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.toLowerCase().includes(id.replace(/-/g, ' ')))?.scrollIntoView({ behavior: 'smooth' }); }
  openSearch() { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true })); }
  goHome() { this.router.navigate(['/']); }
  viewDoc(d: Doc) { this.router.navigate(['/doc', d.id]); }
  goToTerminal() { this.router.navigate(['/terminal']); }
  goToModeration() { this.router.navigate(['/moderation']); }
}
