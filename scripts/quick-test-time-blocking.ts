import {
  loadBlockedTimesConfig,
  isTimeSlotBlocked,
  filterBlockedTimeSlots,
  validateBlockedTimesConfig,
  getBlockedTimeSlotsForEnvironment,
} from "../lib/time-blocking";

console.log("=== Time Blocking Quick Test ===");

const validationResult = validateBlockedTimesConfig();
console.log("\n1. Configuration validation:");
console.log(`   - Valid: ${validationResult.valid}`);
if (validationResult.errors.length > 0) {
  console.log("   - Errors:", validationResult.errors);
}

const config = loadBlockedTimesConfig();
console.log("\n2. Loaded config:");
console.log(`   - Total blocked slots: ${config.blockedSlots.length}`);
config.blockedSlots.forEach(slot => {
  console.log(`     - ${slot.id} (${slot.type})`);
});

console.log("\n3. Production blocked slots:");
const prodSlots = getBlockedTimeSlotsForEnvironment("production");
console.log(`   - Count: ${prodSlots.length}`);
prodSlots.forEach(slot => {
  console.log(`     - ${slot.reason}`);
});

console.log("\n4. Testing individual time slots:");
const testCases = [
  {
    name: "Christmas Day (Production)",
    start: "2026-12-25T10:00:00Z",
    end: "2026-12-25T11:00:00Z",
    env: "production",
    shouldBeBlocked: true
  },
  {
    name: "Normal Day (Production)",
    start: "2026-05-27T10:00:00Z",
    end: "2026-05-27T11:00:00Z",
    env: "production",
    shouldBeBlocked: false
  },
  {
    name: "Maintenance Window (Production)",
    start: "2026-06-01T03:00:00Z",
    end: "2026-06-01T03:30:00Z",
    env: "production",
    shouldBeBlocked: true
  },
  {
    name: "Maintenance Window (Staging)",
    start: "2026-06-01T03:00:00Z",
    end: "2026-06-01T03:30:00Z",
    env: "staging",
    shouldBeBlocked: false
  },
  {
    name: "Team Event (Staging)",
    start: "2026-07-15T10:00:00Z",
    end: "2026-07-15T11:00:00Z",
    env: "staging",
    shouldBeBlocked: true
  }
];

testCases.forEach(test => {
  const isBlocked = isTimeSlotBlocked(new Date(test.start), new Date(test.end), test.env as any);
  const status = isBlocked === test.shouldBeBlocked ? "✅ PASS" : "❌ FAIL";
  console.log(`   ${status} - ${test.name}`);
  console.log(`      Expected: ${test.shouldBeBlocked ? "Blocked" : "Available"}, Got: ${isBlocked ? "Blocked" : "Available"}`);
});

console.log("\n5. Testing slot filtering (Staging):");
const testSlots = [
  { start: "2026-12-25T10:00:00Z", end: "2026-12-25T11:00:00Z", id: "slot-1" },
  { start: "2026-05-27T10:00:00Z", end: "2026-05-27T11:00:00Z", id: "slot-2" },
  { start: "2026-07-15T10:00:00Z", end: "2026-07-15T11:00:00Z", id: "slot-3" }
];
const filtered = filterBlockedTimeSlots(testSlots, "staging");
console.log(`   - Input slots: ${testSlots.length}`);
console.log(`   - Filtered slots: ${filtered.length}`);
console.log(`   - Remaining slots: ${filtered.map(s => s.id).join(", ")}`);

console.log("\n=== Quick Test Complete ===");
