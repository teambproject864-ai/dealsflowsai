import { storeMemory, retrieveMemories, consolidateMemories, applyForgetting, ALMAMemory } from '../lib/alma';

async function testALMA() {
  console.log('--- Starting ALMA Integration Test ---');

  const leadId = 'test-lead-' + Date.now();
  const sessionId = 'session-' + Date.now();

  try {
    // 1. Test Store (Short-Term)
    console.log('Testing Store (STM)...');
    const m1 = await storeMemory({
      leadId,
      sessionId,
      agentName: 'TestAgent',
      category: 'Insight',
      content: 'User prefers dark mode and fast responses.',
      importance: 8,
      keywords: ['dark mode', 'fast'],
      layer: 'short-term'
    });
    console.log('Stored STM:', m1?.id);

    // 2. Test Retrieve
    console.log('Testing Retrieve...');
    const results = await retrieveMemories({ leadId, sessionId });
    console.log('Retrieved count:', results.length);
    if (results.length === 0) throw new Error('Retrieve failed');

    // 3. Test Consolidation
    console.log('Testing Consolidation (STM -> LTM)...');
    await consolidateMemories();
    const ltmResults = await retrieveMemories({ leadId, layer: 'long-term' });
    console.log('Retrieved LTM count:', ltmResults.length);

    // 4. Test Forgetting (Mock old memory)
    console.log('Testing Forgetting...');
    await applyForgetting();
    console.log('Forgetting cycle complete.');

    console.log('--- ALMA Integration Test Passed ---');
  } catch (error) {
    console.error('--- ALMA Integration Test Failed ---');
    console.error(error);
    process.exit(1);
  }
}

testALMA();
