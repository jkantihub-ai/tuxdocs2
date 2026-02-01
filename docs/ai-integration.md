
# AI Integration Strategy

Modern TLDP utilizes **Google Gemini 2.5 Flash** to perform real-time transformation and generation tasks. This document details the specific AI patterns employed.

## Model Configuration

We utilize the `gemini-2.5-flash` model for its balance of speed and reasoning capability, which is crucial for interactive UI elements like the Terminal and Chat Assistant.

## AI Capabilities

### 1. Legacy Modernization (The "Rewriter")
**Goal**: Convert 20-year-old Linux guides (e.g., using `ipchains`) into modern standards (`nftables`).

**Technique**:
- **Prompting**: We use a strict structural prompt asking the model to separate "The Why" (Philosophy) from "The How" (Modern Implementation).
- **Context**: The full raw markdown of the legacy document is passed as context.

### 2. Semantic Search
**Goal**: Allow natural language queries (e.g., "How do I secure my server?") to find documents that don't necessarily match keywords.

**Technique**:
- **RAG-Lite**: We feed a catalog (ID, Title, Description, Keywords) to the model and ask it to return a JSON array of the top 3 matching IDs based on the user's intent.

### 3. Virtual Terminal Simulation
**Goal**: A safe sandbox for users to try commands found in the docs.

**Technique**:
- **State Tracking**: The client maintains the `cwd` (Current Working Directory) and command history.
- **Simulation**: The prompt asks Gemini to act as an "Ubuntu 24.04 Kernel". It receives the history and the new command.
- **Output**: The model generates the standard `stdout`/`stderr` text.
- **State Updates**: If the user runs `cd`, the model is instructed to output a specific JSON signal (`{"cwd": "..."}`) which the frontend parses to update the UI state.

### 4. Interactive Walkthroughs (Generative UI)
**Goal**: Convert static text into a wizard-like interface.

**Technique**:
- **Structured Output**: We request a JSON Array response with a specific schema (`title`, `explanation`, `command`, `verification`).
- **Parsing**: The frontend renders this JSON as a stepper UI, allowing users to progress through the guide interactively.

### 5. Community Moderation (AI Analysis)
**Goal**: Assist human moderators by pre-screening contributions.

**Technique**:
- **Risk Assessment**: The model compares the original content vs. the proposed content.
- **Analysis**: It generates a `riskLevel` (Low/Medium/High), a `qualityScore` (1-10), and a summary of changes. This helps catch malicious edits (e.g., `rm -rf /`) before a human even looks at it.
