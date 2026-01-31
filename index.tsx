
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { AppComponent } from './src/app.component';
import { DocViewerComponent } from './src/components/doc-viewer/doc-viewer.component';

const routes: Routes = [
  { path: '', component: DocViewerComponent }, 
  { path: 'doc/:id', component: DocViewerComponent },
  { path: 'terminal', loadComponent: () => import('./src/components/virtual-terminal/virtual-terminal.component').then(m => m.VirtualTerminalComponent) },
  { path: 'moderation', loadComponent: () => import('./src/components/community-moderation/community-moderation.component').then(m => m.CommunityModerationComponent) }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
