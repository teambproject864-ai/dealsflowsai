
import assert from "assert";
import { Feature, FEATURE_CATEGORIES } from "../lib/features";

/**
 * Performance test for the Features page logic.
 * Simulates a large number of features and measures the time for common operations
 * like filtering and searching, which happen on the client side.
 */

function generateLargeFeatureSet(count: number): Feature[] {
  const features: Feature[] = [];
  const statuses: ('active' | 'beta' | 'planned' | 'deprecated')[] = ['active', 'beta', 'planned', 'deprecated'];
  const icons = ['Zap', 'Shield', 'MessageSquare', 'TrendingUp', 'Users', 'Bot', 'Layers', 'Mail', 'Phone', 'BarChart', 'Settings', 'Lock', 'Workflow', 'Search', 'Bell', 'Calendar'];

  for (let i = 0; i < count; i++) {
    features.push({
      id: `feature-${i}`,
      name: `Feature ${i}`,
      description: `This is a description for feature number ${i}. It contains some keywords like AI and automation.`,
      category: FEATURE_CATEGORIES[i % FEATURE_CATEGORIES.length],
      iconName: icons[i % icons.length],
      status: statuses[i % statuses.length],
      isNew: i % 10 === 0,
      updatedAt: new Date().toISOString()
    });
  }
  return features;
}

function testPerformance() {
  const COUNT = 1000;
  console.log(`Generating ${COUNT} features for performance testing...`);
  const startTime = performance.now();
  const features = generateLargeFeatureSet(COUNT);
  const endTime = performance.now();
  console.log(`Generation took ${(endTime - startTime).toFixed(2)}ms`);

  // Test Search Performance
  console.log("Testing search performance (query: 'AI')...");
  const searchStartTime = performance.now();
  const searchQuery = "AI";
  const filteredBySearch = features.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const searchEndTime = performance.now();
  console.log(`Search took ${(searchEndTime - searchStartTime).toFixed(2)}ms. Found ${filteredBySearch.length} matches.`);
  assert.ok(searchEndTime - searchStartTime < 50, "Search should take less than 50ms for 1000 features");

  // Test Category Filtering Performance
  console.log(`Testing category filtering performance (category: '${FEATURE_CATEGORIES[0]}')...`);
  const filterStartTime = performance.now();
  const selectedCategory = FEATURE_CATEGORIES[0];
  const filteredByCategory = features.filter(f => f.category === selectedCategory);
  const filterEndTime = performance.now();
  console.log(`Filtering took ${(filterEndTime - filterStartTime).toFixed(2)}ms. Found ${filteredByCategory.length} matches.`);
  assert.ok(filterEndTime - filterStartTime < 10, "Category filtering should take less than 10ms for 1000 features");

  // Test Combined Performance
  console.log("Testing combined search and filtering performance...");
  const combinedStartTime = performance.now();
  const finalFiltered = features.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const combinedEndTime = performance.now();
  console.log(`Combined operation took ${(combinedEndTime - combinedStartTime).toFixed(2)}ms. Found ${finalFiltered.length} matches.`);
  assert.ok(combinedEndTime - combinedStartTime < 50, "Combined operations should take less than 50ms for 1000 features");

  console.log("\n✅ Performance benchmarks passed!");
}

testPerformance();
