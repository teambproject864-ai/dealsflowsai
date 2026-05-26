import fs from "fs";
import path from "path";
import { z } from "zod";

export const blockedTimeSlotSchema = z.object({
  id: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
  reason: z.string().min(1),
  type: z.enum(["holiday", "maintenance", "event", "other"]),
  environments: z.array(z.enum(["production", "staging", "development"])),
});

export const blockedTimesConfigSchema = z.object({
  blockedSlots: z.array(blockedTimeSlotSchema),
});

export type BlockedTimeSlot = z.infer<typeof blockedTimeSlotSchema>;
export type BlockedTimesConfig = z.infer<typeof blockedTimesConfigSchema>;

let cachedConfig: BlockedTimesConfig | null = null;

export function loadBlockedTimesConfig(): BlockedTimesConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = path.join(process.cwd(), "config", "blocked-times.json");

  if (!fs.existsSync(configPath)) {
    throw new Error("Blocked times config file not found at config/blocked-times.json");
  }

  try {
    const rawConfig = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(rawConfig);
    const validated = blockedTimesConfigSchema.parse(parsed);
    cachedConfig = validated;
    return validated;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid blocked times config: ${JSON.stringify(err.issues)}`);
    }
    throw new Error(`Failed to load blocked times config: ${err}`);
  }
}

export function isTimeSlotBlocked(
  slotStart: Date,
  slotEnd: Date,
  environment: "production" | "staging" | "development"
): boolean {
  const config = loadBlockedTimesConfig();

  for (const blocked of config.blockedSlots) {
    if (!blocked.environments.includes(environment)) continue;

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
}

export function filterBlockedTimeSlots(
  slots: Array<{ start: string | Date; end: string | Date; [key: string]: any }>,
  environment: "production" | "staging" | "development"
) {
  return slots.filter((slot) => {
    const start = slot.start instanceof Date ? slot.start : new Date(slot.start);
    const end = slot.end instanceof Date ? slot.end : new Date(slot.end);
    return !isTimeSlotBlocked(start, end, environment);
  });
}

export function getBlockedTimeSlotsForEnvironment(
  environment: "production" | "staging" | "development"
): BlockedTimeSlot[] {
  const config = loadBlockedTimesConfig();
  return config.blockedSlots.filter((slot) => slot.environments.includes(environment));
}

export function validateBlockedTimesConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const config = loadBlockedTimesConfig();

    for (let i = 0; i < config.blockedSlots.length; i++) {
      for (let j = i + 1; j < config.blockedSlots.length; j++) {
        const a = config.blockedSlots[i];
        const b = config.blockedSlots[j];

        const sharedEnvs = a.environments.filter((env) => b.environments.includes(env));
        if (sharedEnvs.length === 0) continue;

        const aStart = new Date(a.start);
        const aEnd = new Date(a.end);
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);

        if (
          (aStart >= bStart && aStart < bEnd) ||
          (aEnd > bStart && aEnd <= bEnd) ||
          (aStart <= bStart && aEnd >= bEnd)
        ) {
          errors.push(
            `Overlapping blocked slots in environments [${sharedEnvs.join(", ")}]: ${a.id} and ${b.id}`
          );
        }
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Invalid config");
  }

  return { valid: errors.length === 0, errors };
}
