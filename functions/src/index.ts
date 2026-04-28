import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const ALMA_COLLECTION = 'alma_memory';

/**
 * Scheduled function to consolidate memories from STM to LTM
 * Runs every day at midnight
 */
export const scheduledConsolidation = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    console.log('Starting memory consolidation...');
    
    try {
      const stmSnapshot = await db.collection(ALMA_COLLECTION)
        .where('layer', '==', 'short-term')
        .where('isConsolidated', '==', false)
        .where('importance', '>=', 7)
        .get();

      if (stmSnapshot.empty) {
        console.log('No memories to consolidate.');
        return null;
      }

      const batch = db.batch();
      
      stmSnapshot.forEach(doc => {
        const data = doc.data();
        
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

      await batch.commit();
      console.log(`Successfully consolidated ${stmSnapshot.size} memories.`);
      return null;
    } catch (error) {
      console.error('Consolidation failed:', error);
      throw error;
    }
  });

/**
 * Scheduled function to apply forgetting mechanism
 * Runs every week on Sunday at 1:00 AM
 */
export const scheduledForgetting = functions.pubsub
  .schedule('0 1 * * 0')
  .onRun(async (context) => {
    console.log('Starting memory forgetting process...');
    
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const snapshot = await db.collection(ALMA_COLLECTION)
        .where('lastAccessed', '<', thirtyDaysAgo)
        .where('importance', '<', 3)
        .limit(500)
        .get();

      if (snapshot.empty) {
        console.log('No stale memories to remove.');
        return null;
      }

      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Successfully removed ${snapshot.size} stale memories.`);
      return null;
    } catch (error) {
      console.error('Forgetting process failed:', error);
      throw error;
    }
  });
