# RAG (Retrieval-Augmented Generation) Integration

This project includes a production-ready RAG pipeline with:
- Document ingestion (PDF, DOCX, TXT)
- Chunking with overlap
- Embeddings via HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`)
- Vector search via Pinecone
- Context-aware answers via HuggingFace chat models

## Architecture

**Storage**
- Firestore:
  - `rag_documents`: document metadata + ingestion status
  - `rag_chunks`: chunk text + offsets (source of truth for retrieved text)
- Pinecone:
  - Namespace: `rag`
  - Records: one per chunk (`id = ${docId}:${chunkIndex}`)
  - Metadata: `{ type: "rag_chunk", docId, docName, mimeType, chunkIndex, ... }`

**Core code**
- Chunking: [chunking.ts](file:///d%3A/DealFlow.ai/lib/rag/chunking.ts)
- Parsing: [parsers.ts](file:///d%3A/DealFlow.ai/lib/rag/parsers.ts)
- Ingestion: [ingest.ts](file:///d%3A/DealFlow.ai/lib/rag/ingest.ts)
- Search: [search.ts](file:///d%3A/DealFlow.ai/lib/rag/search.ts)
- QA: [qa.ts](file:///d%3A/DealFlow.ai/lib/rag/qa.ts)

## Environment variables

Required:
- `HUGGINGFACE_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`

Optional (tuning):
- `RAG_CHUNK_CHARS` (default `1200`)
- `RAG_OVERLAP_CHARS` (default `200`)
- `RAG_EMBED_CONCURRENCY` (default `5`)
- `RAG_PINECONE_BATCH` (default `100`)
- `RAG_CACHE_TTL_MS` (default `15000`)
- `RAG_MAX_UPLOAD_BYTES` (default `15728640` = 15MB)
- `RAG_LLM_PROVIDER` (`huggingface` | `nvidia`, default `huggingface`)
- `RAG_LLM_MODEL` (when `RAG_LLM_PROVIDER=nvidia`, default `google/gemma-4-31b-it`)
- `NVIDIA_API_KEY` (required only when `RAG_LLM_PROVIDER=nvidia`)

## API Endpoints

### 1) Upload
`POST /api/rag/upload` (multipart/form-data)
- form fields:
  - `file`: required
  - `name`: optional (overrides file name)

Example:
```bash
curl -s -X POST "http://localhost:3000/api/rag/upload" \
  -F "file=@./docs/sample.pdf" \
  -F "name=Dealflow Spec" | jq
```

Response:
```json
{ "success": true, "docId": "...", "chunkCount": 42 }
```

### 2) Search
`POST /api/rag/search` (JSON)
```json
{ "query": "pricing", "topK": 8, "minScore": 0.2, "docIds": ["..."] }
```

Example:
```bash
curl -s -X POST "http://localhost:3000/api/rag/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"pricing","topK":5}' | jq
```

### 3) Ask (RAG Answer)
`POST /api/rag/ask` (JSON)
```json
{ "question": "What is the refund policy?", "topK": 8, "minScore": 0.2, "docIds": ["..."] }
```

Example:
```bash
curl -s -X POST "http://localhost:3000/api/rag/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"Summarize the key product capabilities.","topK":6}' | jq
```

Using NVIDIA for answer generation:
```bash
curl -s -X POST "http://localhost:3000/api/rag/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"Summarize the key product capabilities.","topK":6,"provider":"nvidia","model":"google/gemma-4-31b-it"}' | jq
```

### 4) List documents
`GET /api/rag/documents`

## Logging and audit trail
- Vector performance metrics are tracked in-memory via [vector-monitor.ts](file:///d%3A/DealFlow.ai/lib/vector-monitor.ts)
- Ingestion writes audit records to Firestore `audit_logs`:
  - `rag_ingest_start`, `rag_ingest_success`, `rag_ingest_failed`

## Tests and benchmarks

Run tests:
```bash
npm run test
```

Run chunking benchmark:
```bash
npm run bench:rag
```

## Deployment notes
- Ensure your deployment platform supports Node runtime for PDF/DOCX parsing.
- If running serverless, keep uploads reasonably small (`RAG_MAX_UPLOAD_BYTES`) and consider moving large-file ingestion to a background worker.
- Pinecone is eventually consistent; retrieval may lag a few seconds after ingestion for new chunks.
