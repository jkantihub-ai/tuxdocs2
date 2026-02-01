
# Feature Guide

## 📖 Document Viewer
The core of the application.
- **Legacy View**: Renders the original HTML/Markdown from TLDP.org.
- **Modern View**: Renders the AI-modernized version.
- **Split View**: Allows side-by-side comparison to see how Linux has evolved over 20 years.
- **Raw Mode**: View the underlying Markdown source.

## 💻 AI Terminal
Accessed via the top navbar or specific guide actions.
- **Simulation**: It is not a real shell. It is a hallucination controlled by Gemini.
- **Safety**: You cannot break the host machine. Files created here exist only in the conversation context.
- **Context**: It attempts to maintain continuity (e.g., if you `mkdir test` and then `ls`, you should see `test`).

## 💬 Doc Assistant
A floating chat bubble available on every document.
- **Context-Aware**: It knows which document you are currently reading.
- **Mode-Aware**: If you are in "Modern Mode", it answers questions based on the modern content. If in "Original", it answers based on the legacy content.

## ⚖️ Moderation Queue
Demonstrates an AI-assisted workflow for open-source maintenance.
- **Proposals**: Users can click "Propose Edit" on any doc.
- **Review**: The "Community" page shows these proposals with an AI-generated impact report.

## 🔍 Semantic Search
Press `Cmd+K` (or `Ctrl+K`) to open.
- Accepts natural language.
- Returns "AI Suggested Docs" based on intent, not just keyword matching.
