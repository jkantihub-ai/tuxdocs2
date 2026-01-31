
import { Injectable, signal } from '@angular/core';
import { ProposalAnalysis } from './gemini.service';

export interface Proposal {
  id: string;
  docId: string;
  docTitle: string;
  originalContent: string;
  proposedContent: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  analysis?: ProposalAnalysis;
}

@Injectable({ providedIn: 'root' })
export class ProposalService {
  proposals = signal<Proposal[]>([
    {
      id: 'mock-1',
      docId: 'ssh-hardening',
      docTitle: 'Securing SSH Service',
      originalContent: 'PermitRootLogin no',
      proposedContent: 'PermitRootLogin prohibit-password',
      author: 'penguin_lover_99',
      status: 'pending',
      timestamp: Date.now() - 1000000,
      analysis: {
        summary: 'Updates root login to allow keys but block passwords.',
        riskLevel: 'LOW',
        qualityScore: 9,
        suggestions: 'Good update for backup scenarios.'
      }
    }
  ]);

  addProposal(p: Omit<Proposal, 'id' | 'status' | 'timestamp'>) {
    const newProp: Proposal = {
      ...p,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      timestamp: Date.now()
    };
    this.proposals.update(list => [newProp, ...list]);
    return newProp;
  }

  updateProposal(id: string, updates: Partial<Proposal>) {
    this.proposals.update(list => list.map(p => p.id === id ? { ...p, ...updates } : p));
  }
}
