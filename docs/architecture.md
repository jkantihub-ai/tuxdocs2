
# Architecture Overview

Modern TLDP is a single-page application (SPA) built to demonstrate the fusion of classical open-source documentation with modern generative AI capabilities.

## Tech Stack

- **Framework**: Angular v21+
- **Language**: TypeScript
- **Change Detection**: Zoneless (`provideZonelessChangeDetection`)
- **Styling**: Tailwind CSS (via CDN for Applet compatibility)
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **Markdown Renderer**: `marked` library

## Core Principles

### 1. Zoneless Angular
The application eschews `zone.js` in favor of the new Signal-based reactivity primitive. This results in:
- Smaller bundle sizes.
- More predictable change detection.
- Explicit state dependencies.

### 2. Service-Based Architecture
State is lifted out of components and managed in singleton services:
- **`DocService`**: Acts as the "Database", serving static JSON content representing the legacy TLDP library.
- **`GeminiService`**: The gateway to the AI model. It handles all prompt engineering, JSON schema validation for structured outputs, and error handling.
- **`ThemeService`**: Manages the user preference for Light/Dark mode using Angular Effects to update the DOM.

### 3. Component Design
Components are `standalone` and focused on specific domains:
- **`DocViewerComponent`**: The main orchestration layer. It handles routing, view modes (Split/Single), and coordinates the AI features.
- **`VirtualTerminalComponent`**: A complex simulator that maintains a transient shell state (`cwd`, `history`) and uses AI to generate realistic output.

## Directory Structure

```text
src/
├── app.component.ts         # Root shell
├── components/              # Feature components
│   ├── ai-search-bar/       # Global command palette
│   ├── doc-chat-assistant/  # Context-aware chat
│   ├── doc-viewer/          # Main reading interface
│   ├── virtual-terminal/    # AI terminal simulator
│   └── ...
├── services/                # Business logic & AI Integration
│   ├── doc.service.ts       # Legacy content store
│   ├── gemini.service.ts    # AI prompt engineering
│   └── ...
└── ...
```
