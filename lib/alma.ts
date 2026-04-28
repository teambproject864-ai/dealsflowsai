// lib/alma.ts
import { db } from './firebase-admin';
import admin from 'firebase-admin';
import { MemoryEntry, MemoryCategory } from './types';
import { hfEmbed } from './huggingface';
import { syncMemoryToPinecone } from './vector-sync';
import { vectorSearch } from './vector-search';

/**
 * ALMA (Agent Learning Memory Architecture)
 * 
 * Hierarchical structure:
 * 1. Short-Term Memory (STM): Session-based, high volatility.
 * 2. Episodic Memory: Specific event/call records (transcripts, outcomes).
 * 3. Long-Term Memory (LTM): Consolidated insights, rules, and knowledge.
 */

export type MemoryLayer = 'short-term' | 'episodic' | 'long-term';

export interface ALMAMemory extends MemoryEntry {
  layer: MemoryLayer;
  sessionId?: string;
  metadata?: Record<string, any>;
  embedding?: number[]; // Vector embedding for semantic search
  decayRate?: number; // For forgetting mechanism
  isConsolidated?: boolean;
}

const ALMA_COLLECTION = 'alma_memory';

/**
 * Store a memory in ALMA with automatic embedding generation
 */
export async function storeMemory(memory: Omit<ALMAMemory, 'id' | 'createdAt' | 'accessCount' | 'lastAccessed'>) {
  if (!db) return null;

  // Generate embedding for semantic search
  const embedding = await hfEmbed(memory.content);

  const entry: ALMAMemory = {
    ...memory,
    embedding,
    createdAt: new Date().toISOString(),
    accessCount: 0,
    lastAccessed: new Date().toISOString(),
    importance: memory.importance || 5,
    decayRate: memory.decayRate || 0.1,
    isConsolidated: false
  };

  const ref = await db.collection(ALMA_COLLECTION).add(entry);
  const finalMemory = { ...entry, id: ref.id };

  // Sync to Pinecone asynchronously
  syncMemoryToPinecone(ref.id, finalMemory).catch(err => 
    console.error(`[ALMA] Failed to sync memory ${ref.id} to Pinecone:`, err)
  );

  return finalMemory;
}

/**
 * Retrieve memories using Vector Similarity Search (Semantic Search)
 */
export async function retrieveMemories(args: {
  leadId?: string;
  sessionId?: string;
  layer?: MemoryLayer;
  keywords?: string[];
  queryText?: string; // Text to search semantically
  limit?: number;
}) {
  if (!db) return [];

  let query: admin.firestore.Query = db.collection(ALMA_COLLECTION);

  if (args.leadId) {
    query = query.where('leadId', 'in', [args.leadId, 'global']);
  }
  if (args.sessionId) {
    query = query.where('sessionId', '==', args.sessionId);
  }
  if (args.layer) {
    query = query.where('layer', '==', args.layer);
  }

  let memories: ALMAMemory[] = [];

  // Semantic Search logic using Pinecone Vector Search
  if (args.queryText) {
    try {
      const vectorResults = await vectorSearch({
        query: args.queryText,
        leadId: args.leadId,
        sessionId: args.sessionId,
        layer: args.layer,
        limit: args.limit || 10
      });
      
      memories = vectorResults.map(res => res.memory);
    } catch (err) {
      console.warn('Pinecone vector search failed, falling back to keyword search:', err);
      // Fallback to standard query if vector search fails
      const snapshot = await query
        .limit(args.limit || 10)
        .get();

      snapshot.forEach(doc => {
        memories.push({ id: doc.id, ...doc.data() } as ALMAMemory);
      });
    }
  } else {
    // Fallback to keyword/importance search
  let snapshot;
  try {
    snapshot = await query
      .limit(args.limit || 10)
      .get();
  } catch (err) {
    console.warn('Basic query failed:', err);
    snapshot = { empty: true, forEach: () => {} };
  }

    snapshot.forEach((doc: any) => {
      memories.push({ id: doc.id, ...doc.data() } as ALMAMemory);
    });
  }

  // Update access stats
  if (memories.length > 0) {
    const batch = db.batch();
    memories.forEach(m => {
      if (m.id) {
        batch.update(db.collection(ALMA_COLLECTION).doc(m.id), {
          accessCount: admin.firestore.FieldValue.increment(1),
          lastAccessed: new Date().toISOString()
        });
      }
    });
    await batch.commit().catch(e => console.error('ALMA access update failed:', e));
  }

  return memories;
}

/**
 * Memory Consolidation: Transfer STM to LTM if importance is high or frequency is high
 */
export async function consolidateMemories() {
  if (!db) return;

  // Find STM entries that are important and not yet consolidated
  let stmSnapshot;
  try {
    stmSnapshot = await db.collection(ALMA_COLLECTION)
      .where('layer', '==', 'short-term')
      .where('isConsolidated', '==', false)
      .where('importance', '>=', 7)
      .get();
  } catch (err) {
    console.warn('Consolidation query failed (missing index), falling back to basic layer query:');
    stmSnapshot = await db.collection(ALMA_COLLECTION)
      .where('layer', '==', 'short-term')
      .get();
  }

  const batch = db.batch();
  
  stmSnapshot.forEach(doc => {
    const data = doc.data() as ALMAMemory;
    
    // Create LTM version
    const ltmRef = db.collection(ALMA_COLLECTION).doc();
    batch.set(ltmRef, {
      ...data,
      layer: 'long-term',
      isConsolidated: true,
      createdAt: new Date().toISOString(),
      metadata: { ...data.metadata, consolidatedFrom: doc.id }
    });

  // Mark original as consolidated
  batch.update(doc.ref, { isConsolidated: true });
});

if (stmSnapshot.empty) return;
await batch.commit();
}

/**
 * Forgetting Mechanism: Remove or archive low-importance, old memories
 */
export async function applyForgetting() {
  if (!db) return;

  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Find old, low-access, low-importance memories
  let snapshot;
  try {
    snapshot = await db.collection(ALMA_COLLECTION)
      .where('lastAccessed', '<', thirtyDaysAgo)
      .where('importance', '<', 3)
      .limit(100)
      .get();
  } catch (err) {
    console.warn('Forgetting query failed (missing index), falling back to basic lastAccessed query:');
    snapshot = await db.collection(ALMA_COLLECTION)
      .where('lastAccessed', '<', thirtyDaysAgo)
      .limit(100)
      .get();
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
