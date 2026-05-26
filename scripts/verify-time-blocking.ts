import fs from "fs";
import path from "path";
import { getBlockedTimeSlotsForEnvironment, filterBlockedTimeSlots } from "../lib/time-blocking";

const environment = process.env.VERIFY_ENVIRONMENT || "staging";
const verifyUrl = process.env.VERIFY_URL;

console.log(`Verifying time blocking in ${environment} environment...`);

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logPath = path.join(logsDir, "deployment.log");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + "\n");
};

try {
  const blockedSlots = getBlockedTimeSlotsForEnvironment(environment as any);
  log(`Found ${blockedSlots.length} blocked slots for ${environment}`);

  const testSlots = [
    {
      start: "2026-12-25T10:00:00Z",
      end: "2026-12-25T11:00:00Z",
      id: "test-slot-1"
    },
    {
      start: "2026-06-01T03:00:00Z",
      end: "2026-06-01T04:00:00Z",
      id: "test-slot-2"
    },
    {
      start: "2026-07-15T10:00:00Z",
      end: "2026-07-15T11:00:00Z",
      id: "test-slot-3"
    },
    {
      start: "2026-05-27T10:00:00Z",
      end: "2026-05-27T11:00:00Z",
      id: "test-slot-4"
    }
  ];

  const filteredSlots = filterBlockedTimeSlots(testSlots, environment as any);
  log(`Filtered slots: ${filteredSlots.length} out of ${testSlots.length}`);

  const exposedBlockedSlots = filteredSlots.filter(slot => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    for (const blocked of blockedSlots) {
      const blockedStart = new Date(blocked.start);
      const blockedEnd = new Date(blocked.end);

      if (
        (slotStart >= blockedStart && slotStart < blockedEnd) ||
        (slotEnd > blockedStart && slotEnd <= blockedEnd) ||
        (slotStart <= blockedStart && slotEnd >= blockedEnd)
      ) {
        return true;
      }
    }
    return false;
  });

  if (exposedBlockedSlots.length > 0) {
    log(`❌ ERROR: Found ${exposedBlockedSlots.length} blocked slots exposed to users!`);
    exposedBlockedSlots.forEach(slot => {
      log(`  - Exposed slot: ${slot.id} (${slot.start} - ${slot.end})`);
    });
    logStream.end();
    process.exit(1);
  }

  log("✅ Time blocking verification passed!");
  log("  - All blocked slots are properly hidden");
  log(`  - Total slots filtered out: ${testSlots.length - filteredSlots.length}`);
  logStream.end();
  process.exit(0);

} catch (err) {
  log(`❌ Verification failed: ${err}`);
  logStream.end();
  process.exit(1);
}
