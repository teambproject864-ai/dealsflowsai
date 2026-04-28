import { db } from './firebase-admin';
import { getPineconeIndex } from './pinecone';
import { ALMAMemory } from './alma';
import { hfEmbed } from './huggingface';

const ALMA_COLLECTION = 'alma_memory';
const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY = 1000; // 1 second between batches

export interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Syncs a single memory document to Pinecone with enhanced metadata and error handling.
 */
export async function syncMemoryToPinecone(memoryId: string, data: ALMAMemory) {
  const index = await getPineconeIndex();
  if (!index) throw new Error('Pinecone index not initialized');

  try {
    // 1. Ensure we have an embedding
    let embedding = data.embedding;
    if (!embedding || embedding.length === 0) {
      console.log(`[VectorSync] Generating missing embedding for memory ${memoryId}...`);
      embedding = await hfEmbed(data.content);
    }

    if (!embedding) {
      throw new Error(`Could not generate embedding for memory ${memoryId}`);
    }

    // 2. Prepare metadata (sanitized for Pinecone)
    const metadata: Record<string, any> = {
      leadId: data.leadId || 'global',
      content: data.content.substring(0, 10000), // Pinecone metadata limit
      category: data.category || 'general',
      layer: data.layer || 'long-term',
      importance: data.importance || 1,
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    };

    if (data.sessionId) metadata.sessionId = data.sessionId;
    if (data.agentName) metadata.agentName = data.agentName;

    // 3. Upsert to Pinecone
    console.log(`[VectorSync] Upserting record ${memoryId} to Pinecone (dim: ${embedding.length})...`);
    
    try {
      // @ts-ignore
      await index.upsert({
        records: [{
          id: memoryId,
          values: embedding,
          metadata: metadata
        }]
      });
    } catch (upsertError: any) {
      console.error(`[VectorSync] Upsert failed for ${memoryId}:`, upsertError);
      throw upsertError;
    }

    // 4. Update Firestore to mark as synced (optional but good for consistency)
    if (db) {
      const docRef = db.collection(ALMA_COLLECTION).doc(memoryId);
      const doc = await docRef.get();
      if (doc.exists) {
        await docRef.update({
          syncedToVector: true,
          lastSyncedAt: new Date().toISOString()
        }).catch(err => console.warn(`[VectorSync] Could not update sync status in Firestore: ${err.message}`));
      } else {
        console.log(`[VectorSync] Document ${memoryId} not found in Firestore, skipping status update.`);
      }
    }

    console.log(`[VectorSync] Successfully synced memory ${memoryId} to Pinecone.`);
    return true;
  } catch (error: any) {
    console.error(`[VectorSync] Error syncing memory ${memoryId}:`, error);
    return false;
  }
}

/**
 * Deletes a memory from Pinecone.
 */
export async function deleteMemoryFromPinecone(memoryId: string) {
  const index = await getPineconeIndex();
  if (!index) return;

  try {
    // @ts-ignore
    await index.deleteMany({ ids: [memoryId] });
    console.log(`[VectorSync] Successfully deleted memory ${memoryId} from Pinecone.`);
  } catch (error) {
    console.error(`[VectorSync] Error deleting memory ${memoryId}:`, error);
  }
}

/**
 * Batch syncs all Firestore memories to Pinecone with rate limiting and progress tracking.
 */
export async function fullSyncFirestoreToPinecone(): Promise<SyncStats> {
  const stats: SyncStats = { total: 0, synced: 0, failed: 0, errors: [] };
  
  if (!db) {
    stats.errors.push('Firestore database not initialized');
    return stats;
  }
  
  const index = await getPineconeIndex();
  if (!index) {
    stats.errors.push('Pinecone index not initialized');
    return stats;
  }

  console.log('[VectorSync] Starting full Firestore to Pinecone sync...');
  
  try {
    const snapshot = await db.collection(ALMA_COLLECTION).get();
    stats.total = snapshot.size;
    console.log(`[VectorSync] Found ${stats.total} memories to sync.`);

    let currentBatch: any[] = [];
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data() as ALMAMemory;
        let embedding = data.embedding;

        if (!embedding || embedding.length === 0) {
          embedding = await hfEmbed(data.content);
        }

        if (embedding) {
          currentBatch.push({
            id: doc.id,
            values: embedding,
            metadata: {
              leadId: data.leadId || 'global',
              sessionId: data.sessionId || '',
              agentName: data.agentName || '',
              category: data.category || '',
              content: data.content.substring(0, 10000),
              importance: data.importance || 5,
              layer: data.layer || 'short-term',
              createdAt: data.createdAt || new Date().toISOString(),
            },
          });
        } else {
          stats.failed++;
          stats.errors.push(`Could not generate embedding for ${doc.id}`);
        }

        if (currentBatch.length >= BATCH_SIZE) {
          // @ts-ignore
          await index.upsert({ records: currentBatch });
          stats.synced += currentBatch.length;
          console.log(`[VectorSync] Synced ${stats.synced}/${stats.total} vectors...`);
          currentBatch = [];
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      } catch (docError: any) {
        stats.failed++;
        stats.errors.push(`Error processing doc ${doc.id}: ${docError.message}`);
      }
    }

    if (currentBatch.length > 0) {
      // @ts-ignore
      await index.upsert({ records: currentBatch });
      stats.synced += currentBatch.length;
    }

    console.log(`[VectorSync] Full sync complete. Synced: ${stats.synced}, Failed: ${stats.failed}`);
  } catch (error: any) {
    console.error('[VectorSync] Fatal error during full sync:', error);
    stats.errors.push(`Fatal error: ${error.message}`);
  }

  return stats;
}

/**
 * Health check for vector storage system.
 */
export async function checkVectorHealth() {
  const status = {
    pinecone: false,
    firestore: false,
    embeddings: false,
    indexStats: null as any
  };

  try {
    const index = await getPineconeIndex();
    if (index) {
      status.pinecone = true;
      status.indexStats = await index.describeIndexStats();
    }
  } catch (e) {
    console.error('[Health] Pinecone health check failed:', e);
  }

  try {
    if (db) {
      await db.collection(ALMA_COLLECTION).limit(1).get();
      status.firestore = true;
    }
  } catch (e) {
    console.error('[Health] Firestore health check failed:', e);
  }

  try {
    const testEmbed = await hfEmbed('health check');
    if (testEmbed && testEmbed.length > 0) {
      status.embeddings = true;
    }
  } catch (e) {
    console.error('[Health] Embeddings health check failed:', e);
  }

  return status;
}
