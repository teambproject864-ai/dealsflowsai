import { storeMemory, retrieveMemories, consolidateMemories, applyForgetting, ALMAMemory } from '../lib/alma';

async function testALMASemantic() {
  console.log('--- Starting ALMA Semantic Search Test ---');

  const leadId = 'semantic-test-' + Date.now();
  const sessionId = 'session-' + Date.now();

  try {
    // 1. Store memories with distinct semantic content
    console.log('Storing memories with distinct topics...');
    
    await storeMemory({
      leadId,
      sessionId,
      agentName: 'TestAgent',
      category: 'Preference',
      content: 'The user highly values data privacy and security protocols.',
      importance: 9,
      keywords: ['privacy', 'security'],
      layer: 'short-term'
    });

    await storeMemory({
      leadId,
      sessionId,
      agentName: 'TestAgent',
      category: 'Objection',
      content: 'The client mentioned a budget constraint of around $50,000 for this quarter.',
      importance: 7,
      keywords: ['budget', 'pricing'],
      layer: 'short-term'
    });

    // Wait for async Pinecone sync and indexing
    console.log('Waiting for Pinecone indexing (5s)...');
    await new Promise(r => setTimeout(r, 5000));

    // 2. Test Semantic Retrieval
    console.log('Testing semantic retrieval for "security and data protection"...');
    const privacyResults = await retrieveMemories({
      leadId,
      queryText: 'security and data protection',
      limit: 1
    });

    const result1 = privacyResults[0]?.content;
    console.log('Semantic Result 1:', result1);
    if (!result1 || !result1.includes('privacy')) {
      console.warn('Warning: Semantic search match not found or imprecise.');
    }

    console.log('Testing semantic retrieval for "financial limits and costs"...');
    const budgetResults = await retrieveMemories({
      leadId,
      queryText: 'financial limits and costs',
      limit: 1
    });

    const result2 = budgetResults[0]?.content;
    console.log('Semantic Result 2:', result2);

    // 3. Test Consolidation
    console.log('Verifying consolidation of important semantic memories...');
    await consolidateMemories();
    const ltm = await retrieveMemories({ leadId, layer: 'long-term' });
    console.log('LTM Count after consolidation:', ltm.length);

    console.log('--- ALMA Semantic Search Test Complete ---');
  } catch (error) {
    console.error('--- ALMA Semantic Search Test Failed ---');
    console.error(error);
    process.exit(1);
  }
}

testALMASemantic();
