# Vector Storage Solution: Pinecone + Firebase Integration

This document outlines the architecture, implementation, and maintenance of the vector storage solution used for semantic search and long-term memory in the DealFlow.ai platform.

## 🏗️ System Architecture

The solution integrates **Pinecone** (Vector Database) with **Firebase Firestore** (Metadata & Source of Truth).

1.  **Firebase Firestore**: Stores the full document data, including content, raw metadata, and sync status.
2.  **Pinecone**: Stores vector embeddings and a subset of metadata for high-speed semantic retrieval and filtering.
3.  **HuggingFace Inference**: Used to generate high-quality 384-dimensional embeddings using the `all-MiniLM-L6-v2` model.

## 🌲 Pinecone Configuration

-   **Index Name**: `dealflow-memories`
-   **Dimension**: 384 (Matches HuggingFace `all-MiniLM-L6-v2`)
-   **Metric**: `cosine` (Optimal for semantic similarity)
-   **Cloud**: AWS (`us-east-1`)
-   **Type**: Serverless

## 📄 Data Models

### ALMAMemory (Firestore & Pinecone Metadata)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Unique identifier (matches Firestore Doc ID) |
| `content` | string | The actual text information |
| `leadId` | string | ID of the lead this memory belongs to |
| `category` | string | Classification (Insight, Action, Knowledge) |
| `importance` | number | 1-10 priority scale |
| `layer` | string | short-term or long-term |
| `embedding` | number[] | 384-dim vector (stored in Pinecone values) |

## 🚀 Key Operations

### 1. Synchronization (`lib/vector-sync.ts`)
-   `syncMemoryToPinecone(id, data)`: Individual document sync.
-   `fullSyncFirestoreToPinecone()`: Batch migration with rate limiting and progress tracking.
-   `deleteMemoryFromPinecone(id)`: Removes entry from vector database.

### 2. Search (`lib/vector-search.ts`)
-   `vectorSearch(params)`: Semantic search with metadata filtering (leadId, category, etc.).
-   `hybridSearch(params)`: Combined search approach for maximum relevance.

### 3. Monitoring (`lib/vector-monitor.ts`)
-   `logVectorMetric()`: Tracks latency and success rates.
-   `getVectorSystemReport()`: Generates health and performance overview.

## 🛡️ Security Measures

-   **Encryption**: Data is encrypted at rest by Pinecone/Firebase and in transit via TLS 1.3.
-   **Access Control**: Firestore rules enforce authenticated access. Pinecone access is restricted to the Admin SDK.
-   **API Key Management**: Secure fallback and environment variable support.

## 🛠️ Deployment Procedures

1.  **Environment Variables**:
    -   `PINECONE_API_KEY`: Your Pinecone secret.
    -   `PINECONE_INDEX`: Index name (default: `dealflow-memories`).
2.  **Initialization**:
    -   Call `initPineconeIndex()` during application startup or deployment scripts.
3.  **Migration**:
    -   Run `fullSyncFirestoreToPinecone()` to populate the index from existing data.

## 🧪 Testing

Run the integration suite to verify connectivity and performance:
```bash
npx ts-node tests/vector-storage.test.ts
```
