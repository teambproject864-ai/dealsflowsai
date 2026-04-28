import { APP_FEATURES } from '../lib/features';

async function testFeatureDeployment() {
  console.log('--- Starting Feature Deployment System Test ---');

  const baseUrl = 'http://localhost:3000'; // Assuming local dev server

  try {
    // 1. Sync initial features
    console.log('Step 1: Syncing initial features to Firestore...');
    const syncRes = await fetch(`${baseUrl}/api/features`, { method: 'PATCH' });
    const syncData = await syncRes.json();
    if (!syncData.success) throw new Error('Sync failed: ' + syncData.error);
    console.log('✓ Features synced successfully.');

    // 2. Fetch current features
    console.log('\nStep 2: Fetching current features...');
    const fetchRes = await fetch(`${baseUrl}/api/features`);
    const fetchData = await fetchRes.json();
    const testFeature = fetchData.features.find((f: any) => f.id === 'ai-analysis');
    console.log(`✓ Found test feature: ${testFeature.name} (v${testFeature.version})`);

    // 3. Simulate a deployment update
    console.log('\nStep 3: Simulating a feature deployment (v2)...');
    const deployRes = await fetch(`${baseUrl}/api/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featureId: 'ai-analysis',
        author: 'System Test Agent',
        notes: 'Enabling advanced neural pathways for GTM analysis.',
        updates: {
          name: 'AI-Powered GTM Analysis Pro',
          description: 'Next-generation GTM analysis with deep neural insights.'
        }
      })
    });
    
    const deployData = await deployRes.json();
    if (!deployData.success) throw new Error('Deployment failed: ' + deployData.error);
    console.log(`✓ Deployment successful. New version: ${deployData.version}`);
    console.log(`✓ New name: ${deployData.feature.name}`);

    // 4. Verify in Firestore
    console.log('\nStep 4: Verifying update in Firestore...');
    const verifyRes = await fetch(`${baseUrl}/api/features`);
    const verifyData = await verifyRes.json();
    const updatedFeature = verifyData.features.find((f: any) => f.id === 'ai-analysis');
    
    if (updatedFeature.version === 2 && updatedFeature.name === 'AI-Powered GTM Analysis Pro') {
      console.log('✓ Verification successful: Firestore updated correctly.');
    } else {
      throw new Error(`Verification failed. Expected v2, got v${updatedFeature.version}`);
    }

    console.log('\n--- Feature Deployment System Test Passed! ---');
  } catch (error) {
    console.error('\n--- Feature Deployment System Test Failed ---');
    console.error(error);
    process.exit(1);
  }
}

// In a real environment, we'd use a test runner, but for this demo:
testFeatureDeployment();
