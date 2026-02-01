
# Scaling Plan: From Prototype to Production

**Current Status**: The application is currently a high-fidelity prototype. It uses an in-memory JSON array (`DocService`) for document storage and performs client-side API calls to Google Gemini.

To scale this project to cover the entire **Linux Documentation Project** (tens of thousands of documents), we propose the following 5-phase roadmap.

## Phase 1: Data Ingestion & Normalization
**Challenge**: TLDP content exists in various legacy formats (HTML, DocBook SGML, XML, Plain Text) scattered across different directory structures.

**Strategy**:
1.  **Ingestion Pipeline**: Build a Python/Node.js crawler to traverse `tldp.org` mirrors.
2.  **Format Unification**: Convert all source formats into standard **CommonMark Markdown**.
3.  **AI Metadata Extraction**: 
    - Use `gemini-1.5-pro` (large context window) to process each raw document.
    - Extract structured metadata: `LastUpdated`, `OriginalAuthor`, `ObsolescenceScore`, `Category`.
    - This replaces the manual JSON entry creation currently used in `DocService`.

## Phase 2: Vector Search & RAG
**Challenge**: The current `semanticSearch` function sends the *entire* document catalog to the LLM's context window. This approach hits context limits (~1M tokens) quickly and becomes expensive/slow as the catalog grows.

**Strategy**: Move to **Retrieval-Augmented Generation (RAG)**.
1.  **Embeddings**: Generate vector embeddings for every document title, description, and content chunks using the `text-embedding-004` model.
2.  **Vector Database**: Store these embeddings in a specialized database (e.g., **Pinecone**, **Weaviate**, or **pgvector**).
3.  **Optimized Search**: 
    - User Query -> Generate Embedding -> Query Vector DB -> Top 5 Matches.
    - Pass only these Top 5 matches to Gemini to generate the final answer or list.

## Phase 3: Asynchronous Modernization (Cost Optimization)
**Challenge**: "Modernizing" a document on-demand takes 5-10 seconds and consumes API quota every time a user clicks the button.

**Strategy**: **Offline Batch Processing**.
1.  **The "To-Modernize" Queue**: Identify documents with `obsolescenceScore > 80`.
2.  **Batch Jobs**: Run the modernization prompts asynchronously in the background.
3.  **Static Storage**: Save the AI-generated "Modern Content" into the database alongside the original.
4.  **Instant Read**: When a user visits "DNS-HOWTO", the modern version loads instantly from the database, rather than generating on the fly.

## Phase 4: Hybrid Infrastructure
**Challenge**: Storing `API_KEY` in the frontend is not secure for a public production app.

**Strategy**:
1.  **Backend Proxy**: Introduce a lightweight backend (Node.js/Go or Serverless Functions).
2.  **API Gateway**: The frontend calls `POST /api/chat`, and the backend handles the actual call to Google GenAI, keeping credentials secret.
3.  **Response Caching**: Implement Redis/CDN caching. If User A asks "How to configure IP?", and User B asks the same 5 minutes later, serve the cached answer.

## Phase 5: Community & Trust (Human-in-the-Loop)
**Challenge**: AI hallucinations (e.g., inventing a flag that doesn't exist) can be dangerous in system administration.

**Strategy**:
1.  **Verification Badge**: Allow trusted community members (via GitHub OAuth) to "Verify" an AI modernization.
2.  **Crowdsourced Correction**: The existing "Propose Edit" feature becomes the primary mechanism for fixing AI errors.
3.  **Trust Tier**: Documents verified by >3 humans get a "Community Verified" badge, distinguishing them from purely "AI Generated" content.
