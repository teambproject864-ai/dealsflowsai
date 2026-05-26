import fs from "fs";
import path from "path";
import { validateBlockedTimesConfig, loadBlockedTimesConfig } from "../lib/time-blocking";

const reportsDir = path.join(process.cwd(), "reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const reportPath = path.join(reportsDir, "blocked-times-validation.json");

console.log("Validating blocked times configuration...");

const validationResult = validateBlockedTimesConfig();
const config = loadBlockedTimesConfig();

const report = {
  timestamp: new Date().toISOString(),
  valid: validationResult.valid,
  errors: validationResult.errors,
  totalSlots: config.blockedSlots.length,
  slotsByEnvironment: {
    production: config.blockedSlots.filter(s => s.environments.includes("production")).length,
    staging: config.blockedSlots.filter(s => s.environments.includes("staging")).length,
    development: config.blockedSlots.filter(s => s.environments.includes("development")).length
  }
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log("Validation complete!");
console.log(`Report saved to: ${reportPath}`);

if (!validationResult.valid) {
  console.error("\n❌ Blocked times configuration is invalid:");
  validationResult.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\n✅ Blocked times configuration is valid!");
  console.log(`Total blocked slots: ${config.blockedSlots.length}`);
  process.exit(0);
}
