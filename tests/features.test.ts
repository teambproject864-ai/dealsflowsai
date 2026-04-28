import assert from "assert";
import { APP_FEATURES, FEATURE_CATEGORIES } from "../lib/features";

function testFeatureStructure() {
  console.log("Testing feature structure...");
  assert.ok(APP_FEATURES.length > 0, "APP_FEATURES should not be empty");
  
  APP_FEATURES.forEach(feature => {
    assert.ok(feature.id, `Feature ${feature.name} missing id`);
    assert.ok(feature.name, `Feature ${feature.id} missing name`);
    assert.ok(feature.description, `Feature ${feature.id} missing description`);
    assert.ok(feature.category, `Feature ${feature.id} missing category`);
    assert.ok(feature.iconName, `Feature ${feature.id} missing iconName`);
    assert.ok(feature.version >= 1, `Feature ${feature.id} version must be at least 1`);
    assert.ok(feature.updatedAt, `Feature ${feature.id} missing updatedAt`);
    assert.ok(['active', 'beta', 'planned', 'deprecated'].includes(feature.status), `Feature ${feature.id} has invalid status: ${feature.status}`);
    assert.ok(FEATURE_CATEGORIES.includes(feature.category), `Feature ${feature.id} has invalid category: ${feature.category}`);
  });
  console.log("ok testFeatureStructure");
}

function testFeatureCategories() {
  console.log("Testing feature categories...");
  assert.ok(FEATURE_CATEGORIES.length > 0, "FEATURE_CATEGORIES should not be empty");
  
  // Verify all categories in APP_FEATURES exist in FEATURE_CATEGORIES
  const usedCategories = new Set(APP_FEATURES.map(f => f.category));
  usedCategories.forEach(cat => {
    assert.ok(FEATURE_CATEGORIES.includes(cat), `Category "${cat}" used in features but not defined in FEATURE_CATEGORIES`);
  });
  console.log("ok testFeatureCategories");
}

async function runTests() {
  try {
    testFeatureStructure();
    testFeatureCategories();
    console.log("\n✅ All features tests passed!");
  } catch (e) {
    console.error("❌ Test failed:", e);
    process.exit(1);
  }
}

runTests();
