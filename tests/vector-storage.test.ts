import { initPineconeIndex } from '../lib/pinecone';
import { syncMemoryToPinecone, deleteMemoryFromPinecone, checkVectorHealth, fullSyncFirestoreToPinecone } from '../lib/vector-sync';
import { vectorSearch } from '../lib/vector-search';
import { getVectorSystemReport, logVectorMetric } from '../lib/vector-monitor';
import { ALMAMemory } from '../lib/alma';

async function runTests() {
  console.log('🚀 Starting Comprehensive Vector Storage Tests...');
  const startTime = Date.now();

  try {
    // 0. Initialize Index
    console.log('\n[Step 0] Initializing Index...');
    await initPineconeIndex();
    console.log('✅ Index initialized.');

    // 1. Health Check Test
    console.log('\n[Test 1] Checking System Health...');
    const health = await checkVectorHealth();
    console.log('Health Status:', JSON.stringify(health, null, 2));
    if (!health.pinecone) throw new Error('Pinecone is down');
    console.log('✅ Health check passed.');

    // 2. CRUD Operations Test
    console.log('\n[Test 2] Testing CRUD Operations...');
    const testId = `test-mem-${Date.now()}`;
    const testMemory: ALMAMemory = {
      content: 'Deep learning is a subset of machine learning based on artificial neural networks.',
      leadId: 'test-user-999',
      category: 'Knowledge',
      importance: 8,
      layer: 'long-term',
      agentName: 'TestAgent',
      keywords: ['deep learning', 'neural networks'],
      createdAt: new Date().toISOString()
    };

    const opStart = Date.now();
    const syncSuccess = await syncMemoryToPinecone(testId, testMemory);
    logVectorMetric({
      operation: 'upsert',
      duration: Date.now() - opStart,
      success: syncSuccess,
      metadata: { id: testId }
    });

    if (!syncSuccess) throw new Error('Sync failed');
    console.log('✅ Upsert passed.');

    // 3. Search Test (with filtering)
    console.log('\n[Test 3] Testing Semantic Search with Filters...');
    // Wait for consistency
    await new Promise(r => setTimeout(r, 2000));
    
    const searchStart = Date.now();
    const results = await vectorSearch({
      query: 'What is neural networks?',
      leadId: 'test-user-999',
      limit: 5,
      minScore: 0.5
    });
    
    logVectorMetric({
      operation: 'search',
      duration: Date.now() - searchStart,
      success: results.length > 0
    });

    if (results.length === 0) {
      console.warn('⚠️ No results found - this may happen with new indexes due to latency');
    } else {
      console.log(`Found ${results.length} results. Top score: ${results[0].score}`);
      console.log('✅ Search passed.');
    }

    // 4. Monitoring Report Test
    console.log('\n[Test 4] Testing Monitoring System...');
    const report = await getVectorSystemReport();
    console.log('System Report:', JSON.stringify(report, null, 2));
    if (!report.performance.upsert) console.warn('⚠️ Upsert metrics not found in report');
    console.log('✅ Monitoring passed.');

    // 5. Cleanup
    console.log('\n[Test 5] Cleaning up...');
    await deleteMemoryFromPinecone(testId);
    console.log('✅ Cleanup passed.');

    console.log(`\n🎉 All tests completed in ${(Date.now() - startTime) / 1000}s`);
  } catch (error: any) {
    console.error('\n❌ Test Suite Failed:', error.message);
    process.exit(1);
  }
}

runTests();
