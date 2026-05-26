import {
  loadBlockedTimesConfig,
  isTimeSlotBlocked,
  filterBlockedTimeSlots,
  validateBlockedTimesConfig,
  getBlockedTimeSlotsForEnvironment,
  BlockedTimeSlot,
} from "../lib/time-blocking";

describe("Time Blocking Tests", () => {
  describe("Configuration Loading", () => {
    test("should load and validate blocked times config", () => {
      const config = loadBlockedTimesConfig();
      expect(config.blockedSlots).toBeDefined();
      expect(Array.isArray(config.blockedSlots)).toBe(true);
      expect(config.blockedSlots.length).toBeGreaterThan(0);
    });

    test("should validate blocked times config with no errors", () => {
      const result = validateBlockedTimesConfig();
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe("Time Slot Blocking Check", () => {
    test("should detect a slot completely within a blocked period", () => {
      const slotStart = new Date("2026-12-25T10:00:00Z");
      const slotEnd = new Date("2026-12-25T11:00:00Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(true);
    });

    test("should detect a slot overlapping the start of a blocked period", () => {
      const slotStart = new Date("2026-12-24T23:30:00Z");
      const slotEnd = new Date("2026-12-25T00:30:00Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(true);
    });

    test("should detect a slot overlapping the end of a blocked period", () => {
      const slotStart = new Date("2026-12-25T23:30:00Z");
      const slotEnd = new Date("2026-12-26T00:30:00Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(true);
    });

    test("should detect a slot completely surrounding a blocked period", () => {
      const slotStart = new Date("2026-12-24T00:00:00Z");
      const slotEnd = new Date("2026-12-26T23:59:59Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(true);
    });

    test("should not block a slot outside all blocked periods", () => {
      const slotStart = new Date("2026-05-27T10:00:00Z");
      const slotEnd = new Date("2026-05-27T11:00:00Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(false);
    });

    test("should respect environment-specific blocking", () => {
      const slotStart = new Date("2026-06-01T03:00:00Z");
      const slotEnd = new Date("2026-06-01T03:30:00Z");
      
      const isProductionBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      const isStagingBlocked = isTimeSlotBlocked(slotStart, slotEnd, "staging");
      
      expect(isProductionBlocked).toBe(true);
      expect(isStagingBlocked).toBe(false);
    });
  });

  describe("Filtering Time Slots", () => {
    test("should filter out blocked slots from an array", () => {
      const testSlots = [
        {
          id: "slot-1",
          start: "2026-12-25T10:00:00Z",
          end: "2026-12-25T11:00:00Z",
        },
        {
          id: "slot-2",
          start: "2026-05-27T10:00:00Z",
          end: "2026-05-27T11:00:00Z",
        },
        {
          id: "slot-3",
          start: "2026-07-15T10:00:00Z",
          end: "2026-07-15T11:00:00Z",
        },
      ];

      const filtered = filterBlockedTimeSlots(testSlots, "staging");
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("slot-2");
    });

    test("should work with Date objects as well as strings", () => {
      const testSlots = [
        {
          id: "slot-1",
          start: new Date("2026-12-25T10:00:00Z"),
          end: new Date("2026-12-25T11:00:00Z"),
        },
        {
          id: "slot-2",
          start: new Date("2026-05-27T10:00:00Z"),
          end: new Date("2026-05-27T11:00:00Z"),
        },
      ];

      const filtered = filterBlockedTimeSlots(testSlots, "production");
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("slot-2");
    });
  });

  describe("Environment-Specific Slots", () => {
    test("should get correct blocked slots for production environment", () => {
      const productionSlots = getBlockedTimeSlotsForEnvironment("production");
      
      expect(productionSlots.length).toBeGreaterThan(0);
      
      const hasChristmasHoliday = productionSlots.some(
        (slot) => slot.id === "company-holiday-2026-12-25"
      );
      const hasMaintenance = productionSlots.some(
        (slot) => slot.id === "maintenance-2026-06-01"
      );
      
      expect(hasChristmasHoliday).toBe(true);
      expect(hasMaintenance).toBe(true);
    });

    test("should get correct blocked slots for staging environment", () => {
      const stagingSlots = getBlockedTimeSlotsForEnvironment("staging");
      
      expect(stagingSlots.length).toBeGreaterThan(0);
      
      const hasChristmasHoliday = stagingSlots.some(
        (slot) => slot.id === "company-holiday-2026-12-25"
      );
      const hasTeamEvent = stagingSlots.some(
        (slot) => slot.id === "team-event-2026-07-15"
      );
      
      expect(hasChristmasHoliday).toBe(true);
      expect(hasTeamEvent).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle exact boundary overlaps correctly", () => {
      const slotStart = new Date("2026-12-26T00:00:00Z");
      const slotEnd = new Date("2026-12-26T01:00:00Z");
      
      const isBlocked = isTimeSlotBlocked(slotStart, slotEnd, "production");
      expect(isBlocked).toBe(false);
    });
  });
});
