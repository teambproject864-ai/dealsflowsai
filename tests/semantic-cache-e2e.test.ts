// tests/semantic-cache-e2e.test.ts
import { storeMemory, retrieveMemories } from '../lib/alma';
import { getSemanticCache } from '../lib/semantic-cache';
import { getHermes } from '../lib/hermes/hermes';

async function runE2ETest() {
  console.log('🚀 Starting Semantic Cache E2E Test...\n');
  const cache = getSemanticCache();
  const hermes = getHermes();
  const leadId = 'test-lead-' + Date.now();
  const sessionId = 'test-session-' + Date.now();

  // Step 1: Store some test memories
  console.log('Step 1: Storing test memories in ALMA...');
  const memory1 = await storeMemory({
    leadId,
    sessionId,
    agentName: 'TestAgent',
    category: 'Insight',
    content: 'The user is interested in machine learning and AI technologies.',
    importance: 9,
    keywords: ['machine learning', 'AI', 'technology'],
    layer: 'short-term',
  });
  const memory2 = await storeMemory({
    leadId,
    sessionId,
    agentName: 'TestAgent',
    category: 'Objection',
    content: 'User is concerned about pricing and wants a discount.',
    importance: 8,
    keywords: ['pricing', 'discount', 'concerned'],
    layer: 'short-term',
  });
  console.log(`✓ Stored ${memory1?.id}, ${memory2?.id}\n`);

  // Step 2: First retrieval (cache miss)
  console.log('Step 2: First retrieval (cache miss)...');
  const start1 = Date.now();
  const results1 = await retrieveMemories({
    leadId,
    queryText: 'What is the user interested in?',
    limit: 2,
  });
  const latency1 = Date.now() - start1;
  console.log(`✓ Retrieved ${results1.length} memories in ${latency1}ms`);
  const metrics1 = cache.getMetrics();
  console.log(`  Cache metrics:`, {
    totalQueries: metrics1.totalQueries,
    hits: metrics1.cacheHits,
    misses: metrics1.cacheMisses,
    hitRate: `${(metrics1.hitRate * 100).toFixed(1)}%`,
  });

  // Step 3: Second retrieval (cache hit)
  console.log('\nStep 3: Second retrieval (cache hit)...');
  const start2 = Date.now();
  const results2 = await retrieveMemories({
    leadId,
    queryText: 'What is the user interested in?',
    limit: 2,
  });
  const latency2 = Date.now() - start2;
  console.log(`✓ Retrieved ${results2.length} memories in ${latency2}ms`);

  // Step 4: Third retrieval with similar query
  console.log('\nStep 4: Third retrieval with similar query...');
  const start3 = Date.now();
  const results3 = await retrieveMemories({
    leadId,
    queryText: 'What does the user like?',
    limit: 2,
  });
  const latency3 = Date.now() - start3;
  console.log(`✓ Retrieved ${results3.length} memories in ${latency3}ms`);

  // Step 5: Get final metrics
  const finalMetrics = cache.getMetrics();
  console.log('\n📊 Final Semantic Cache Metrics:');
  console.log(`  Total Queries: ${finalMetrics.totalQueries}`);
  console.log(`  Cache Hits: ${finalMetrics.cacheHits}`);
  console.log(`  Cache Misses: ${finalMetrics.cacheMisses}`);
  console.log(`  Hit Rate: ${(finalMetrics.hitRate * 100).toFixed(1)}%`);
  console.log(`  Avg Cache Latency: ${finalMetrics.averageCacheLatencyMs.toFixed(1)}ms`);
  console.log(`  Avg Uncached Latency: ${finalMetrics.averageUncachedLatencyMs.toFixed(1)}ms`);
  console.log(`  Latency Improvement: ${finalMetrics.latencyImprovementPercent.toFixed(1)}%`);
  console.log(`  Total Entries: ${finalMetrics.totalEntries}`);

  // Step 6: Verify Hermes integration
  console.log('\n🔍 Hermes Integration Check:');
  const hermesMetrics = hermes.getMetrics();
  console.log(`  Hermes total memories: ${hermesMetrics.totalMemories}`);
  console.log(`  Hermes by tier:`, hermesMetrics.byTier);

  // Step 7: Validate results
  console.log('\n✅ Validation:');
  const allResultsHaveContent = [...results1, ...results2, ...results3].every((r) => r.content);
  console.log(`  All results have content: ${allResultsHaveContent ? 'PASS' : 'FAIL'}`);
  console.log(`  Cache hit on second query: ${finalMetrics.cacheHits >= 1 ? 'PASS' : 'FAIL'}`);
  console.log(`  Latency improved: ${finalMetrics.latencyImprovementPercent > 0 ? 'PASS' : 'FAIL'}`);

  console.log('\n🎉 E2E Test Complete!');
}

runE2ETest().catch(console.error);
