
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-obsolescence-warning',
  standalone: true,
  template: `
    <div class="mb-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg flex items-start space-x-4">
      <div class="flex-shrink-0 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wide mb-1">Legacy Documentation Detected</h3>
        <p class="text-sm text-amber-100/80 leading-relaxed">
          This document was last updated in <span class="font-mono text-amber-300 font-bold">{{ lastUpdated() }}</span> and has a high obsolescence score.
          The recommended modern alternative is <span class="font-mono bg-amber-900/50 px-1 py-0.5 rounded text-amber-300">{{ modernEquivalent() }}</span>.
        </p>
      </div>
    </div>
  `
})
export class ObsolescenceWarningComponent {
  lastUpdated = input.required<string>();
  modernEquivalent = input.required<string>();
}
