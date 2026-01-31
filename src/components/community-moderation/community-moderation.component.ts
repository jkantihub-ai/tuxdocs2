
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProposalService, Proposal } from '../../services/proposal.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-community-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#020617] p-6 pb-20 transition-colors duration-300">
      <!-- Nav -->
      <nav class="flex justify-between items-center mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="flex items-center space-x-3 cursor-pointer group" (click)="goHome()">
          <div class="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center font-bold text-white font-mono">TL</div>
          <span class="font-bold text-slate-800 dark:text-slate-100">Moderation Queue</span>
        </div>
        <button (click)="goHome()" class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Back to Docs</button>
      </nav>

      <div class="max-w-5xl mx-auto">
        <header class="mb-10 text-center">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Community Proposals</h1>
          <p class="text-slate-600 dark:text-slate-400">Review pending documentation updates with AI assistance.</p>
        </header>

        <div class="grid grid-cols-1 gap-6">
          @for (p of proposalService.proposals(); track p.id) {
            <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl" [class.border-l-4]="true" [class.border-l-amber-500]="p.status === 'pending'">
              
              <!-- Proposal Header -->
              <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-[#1e293b]/50">
                <div>
                   <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ p.docTitle }}</h2>
                   <div class="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                     <span>Proposed by <span class="text-orange-600 dark:text-orange-400">@{{ p.author }}</span></span>
                     <span>•</span>
                     <span>{{ p.timestamp | date:'short' }}</span>
                     <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800 uppercase text-[10px] font-bold tracking-wider">{{ p.status }}</span>
                   </div>
                </div>
                
                @if (p.status === 'pending') {
                  <div class="flex gap-2">
                    <button (click)="approve(p)" class="px-4 py-2 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-600/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg transition-colors font-bold text-sm">Approve</button>
                    <button (click)="reject(p)" class="px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg transition-colors font-bold text-sm">Reject</button>
                  </div>
                }
              </div>

              <!-- Content Diff -->
              <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                 <div class="p-6">
                    <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Original Content</h3>
                    <pre class="bg-slate-100 dark:bg-slate-900 p-3 rounded text-slate-600 dark:text-slate-400 text-xs overflow-x-auto border border-slate-200 dark:border-slate-800">{{ p.originalContent }}</pre>
                 </div>
                 <div class="p-6 bg-orange-50 dark:bg-orange-900/5">
                    <h3 class="text-xs font-bold text-orange-600 dark:text-orange-500 uppercase mb-3">Proposed Change</h3>
                    <pre class="bg-white dark:bg-[#0c0a09] p-3 rounded text-orange-800 dark:text-orange-200 text-xs overflow-x-auto border border-orange-200 dark:border-orange-900/30">{{ p.proposedContent }}</pre>
                 </div>
              </div>

              <!-- AI Analysis -->
              @if (p.analysis) {
                 <div class="p-6 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
                    <div class="flex items-center gap-2 mb-4">
                       <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                       <h3 class="font-bold text-purple-600 dark:text-purple-400 text-sm uppercase tracking-wider">AI Automated Review</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div class="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div class="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Risk Level</div>
                          <div class="font-bold" [ngClass]="{'text-green-600 dark:text-green-500': p.analysis.riskLevel === 'LOW', 'text-yellow-600 dark:text-yellow-500': p.analysis.riskLevel === 'MEDIUM', 'text-red-600 dark:text-red-500': p.analysis.riskLevel === 'HIGH'}">
                             {{ p.analysis.riskLevel }}
                          </div>
                       </div>
                       <div class="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div class="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Quality Score</div>
                          <div class="font-bold text-slate-900 dark:text-white">{{ p.analysis.qualityScore }}/10</div>
                       </div>
                       <div class="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-1 md:col-span-1">
                          <div class="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Feedback</div>
                          <div class="text-sm text-slate-700 dark:text-slate-300">{{ p.analysis.suggestions }}</div>
                       </div>
                    </div>
                    <div class="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
                       "{{ p.analysis.summary }}"
                    </div>
                 </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CommunityModerationComponent {
  proposalService = inject(ProposalService);
  router = inject(Router);
  themeService = inject(ThemeService);

  goHome() {
    this.router.navigate(['/']);
  }

  approve(p: Proposal) {
    this.proposalService.updateProposal(p.id, { status: 'approved' });
  }

  reject(p: Proposal) {
    this.proposalService.updateProposal(p.id, { status: 'rejected' });
  }
}
