
# Contributing to Modern TLDP

We welcome contributions! Since this project relies heavily on AI integration, there are a few specific guidelines to follow.

## 1. Adding New Documents
To add a legacy document:
1.  Open `src/services/doc.service.ts`.
2.  Add a new entry to the `docs` array.
3.  Ensure you set a high `obsolescenceScore` (>80) to trigger the "Modernize" features in the UI.
4.  Provide a valid `sourceUrl` pointing to `tldp.org` to ensure proper attribution.

## 2. Modifying Prompts
All AI logic resides in `src/services/gemini.service.ts`.
- **System Instructions**: If you change the persona of the AI (e.g., "You are a Linux Kernel"), test it across multiple scenarios.
- **JSON Schemas**: If you modify the expected JSON output, you must update the TypeScript interfaces (`WalkthroughStep`, `ProposalAnalysis`) to match.

## 3. Style Guide
- **Code**: Follow standard Angular style guide. Use Signals for state.
- **Design**: Use Tailwind utility classes. Do not write custom CSS unless absolutely necessary (use `styles` in component metadata).
- **Themes**: All UI components must support both Light and Dark modes.

## 4. Running Locally
```bash
# Install dependencies
npm install

# Run development server
npm start
```
