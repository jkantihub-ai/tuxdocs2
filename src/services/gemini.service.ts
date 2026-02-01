
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Doc } from './doc.service';

export interface WalkthroughStep {
  title: string;
  explanation: string;
  command: string;
  verification: string;
}

export interface ProposalAnalysis {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  qualityScore: number;
  suggestions: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY']! });
  }

  /**
   * SEMANTIC SEARCH
   */
  async semanticSearch(query: string, availableDocs: Doc[]): Promise<string[]> {
    const catalog = availableDocs.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      keywords: d.category
    }));

    const prompt = `
      You are a search engine for Linux documentation.
      User Query: "${query}"
      
      Here is the document catalog:
      ${JSON.stringify(catalog)}
      
      Return a JSON array of the top 3 Document IDs that best answer the query.
      If nothing is relevant, return an empty array.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const json = JSON.parse(response.text || '[]');
      return json;
    } catch (e) {
      console.error('Search failed', e);
      return [];
    }
  }

  /**
   * SUMMARIZATION: Executive Brief
   */
  async summarize(docContent: string): Promise<string> {
    const prompt = `
      You are the Editor-in-Chief of "Linux Pro Magazine".
      Write a featured "Executive Brief" sidebar for this documentation.

      Output strictly in Markdown.

      Structure:
      ### 🚀 The Hook
      (One exciting sentence explaining why this matters today)

      ### ⚡ Core Commands
      (3 bullet points with command examples if applicable)

      ### 🛡️ Admin's Edge
      (A specific security tip, performance hack, or modern alternative recommendation)

      Document:
      ${docContent}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt
      });
      return response.text || 'Could not generate summary.';
    } catch (e) {
      return 'Error generating summary.';
    }
  }

  /**
   * INTERACTIVE WALKTHROUGH
   */
  async generateWalkthrough(docContent: string): Promise<WalkthroughStep[]> {
    const prompt = `
      You are a Technical Instructor.
      Analyze the following documentation and convert it into a linear, step-by-step interactive lab.
      
      Extract clean commands, provide clear explanations for beginners, and include a verification step to check if the command worked.
      
      Output JSON Array.
      
      Document:
      ${docContent}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Short title of the step' },
                explanation: { type: Type.STRING, description: 'Why are we doing this?' },
                command: { type: Type.STRING, description: 'The exact bash command to run (empty if conceptual step)' },
                verification: { type: Type.STRING, description: 'How to verify the result' }
              },
              required: ['title', 'explanation', 'command', 'verification']
            }
          }
        }
      });
      
      return JSON.parse(response.text || '[]') as WalkthroughStep[];
    } catch (e) {
      console.error('Walkthrough generation failed', e);
      return [];
    }
  }

  /**
   * LEGACY MODERNIZER
   */
  async modernizeDoc(docContent: string): Promise<string> {
    const prompt = `
      You are a Senior Technical Writer redesigning legacy Linux docs for a modern audience.
      
      Your goal is to clearly separate the CONCEPT ("The Why") from the EXECUTION ("The How").

      Strict Structure:
      
      ## 1. The Why (Concept & Philosophy)
      - **Essence**: Retain the *essence* of the original introduction. Why does this guide exist?
      - **The Shift**: Explain why we are using modern tools (e.g., ip vs ifconfig) in this context. 
      - **Tone**: Keep the tone educational and philosophical, honoring the original author's intent while bridging to the future.

      ## 2. The How (Modern Implementation)
      - **Prerequisites**: What is needed?
      - **Action Plan**: Numbered, clear steps using MODERN standards (systemd, nftables, iproute2).
      - **Verification**: Commands to verify success.
      - **Troubleshooting**: One or two common pitfalls.

      Output strict Markdown.

      Original Document:
      ${docContent}
    `;
    
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt
      });
      return response.text || docContent;
    } catch (e) {
      return docContent;
    }
  }

  /**
   * VIRTUAL TERMINAL SIMULATION
   */
  async simulateTerminal(history: string[], command: string, cwd: string): Promise<{ output: string, newCwd?: string }> {
    const prompt = `
      You are a simulation of a Linux Ubuntu 24.04 LTS terminal.
      
      Current Working Directory: ${cwd}
      User: root
      
      Interaction History (last 5 lines):
      ${history.slice(-5).join('\n')}
      
      User Command: "${command}"
      
      Task:
      1. Simulate the stdout and stderr of the command accurately.
      2. If the user runs 'cd', 'pushd', or 'popd', output the new directory in this specific JSON format at the end: {"cwd": "/new/path"}.
      3. If the command installs packages (apt), simulate the progress bars briefly.
      4. Be realistic. If a file doesn't exist, say so.
      
      Output the raw terminal text response only.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt
      });
      
      let text = response.text || '';
      let newCwd = undefined;

      const jsonMatch = text.match(/\{"cwd":\s*"(.*?)"\}/);
      if (jsonMatch) {
        newCwd = jsonMatch[1];
        text = text.replace(jsonMatch[0], '');
      }

      return { output: text.trim(), newCwd };
    } catch (e) {
      return { output: 'Terminal Error: Connection to AI Kernel failed.' };
    }
  }

  /**
   * PROPOSAL ANALYZER
   */
  async analyzeProposal(original: string, proposed: string): Promise<ProposalAnalysis> {
    const prompt = `
      You are a Documentation Maintainer Bot.
      Compare the Original and Proposed documentation.

      Original:
      ${original.substring(0, 1000)}...

      Proposed:
      ${proposed.substring(0, 1000)}...

      Output JSON with:
      - summary: One sentence summarizing changes.
      - riskLevel: LOW, MEDIUM, or HIGH (is it malicious? distinct incorrect commands?)
      - qualityScore: 1-10 integer.
      - suggestions: Short constructive feedback.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
              qualityScore: { type: Type.INTEGER },
              suggestions: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}') as ProposalAnalysis;
    } catch (e) {
      return { summary: 'Analysis Failed', riskLevel: 'LOW', qualityScore: 5, suggestions: '' };
    }
  }

  /**
   * CHAT ASSISTANT
   */
  createChatSession(contextDoc: Doc, viewMode: 'original' | 'modern' = 'original', modernContent: string | null = null) {
    const activeContent = viewMode === 'modern' && modernContent ? modernContent : contextDoc.content;

    const systemInstruction = `
      You are a Senior Linux Sysadmin and Open Source Historian.
      Your tone is helpful, technical, but pragmatic.
      CONTEXT: "${contextDoc.title}"
      CONTENT: """${activeContent}"""
    `;

    return this.ai.chats.create({
      model: this.modelId,
      config: {
        systemInstruction: systemInstruction
      }
    });
  }
}
