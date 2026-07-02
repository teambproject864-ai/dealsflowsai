// tests/voice-confirmation.test.ts
import assert from "assert";
import {
  formatE164,
  formatUrlForSpeech,
  verifyCompliance,
  initiateVoiceCall,
  handleCallFailure,
  triggerVoiceFallback,
} from "@/lib/voice-confirmation";

let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    leads: {},
    calls: {},
    analyses: {},
    voice_confirmations: {},
    audit_logs: {},
    user_consent: {},
  };
}

// Setup custom mock Firestore collection implementation
function setupMockFirestore() {
  const mockDb = {
    collection: (collectionName: string) => {
      return {
        doc: (docId: string) => {
          return {
            get: async () => ({
              exists: !!mockStore[collectionName]?.[docId],
              data: () => mockStore[collectionName]?.[docId],
            }),
            set: async (data: any, options?: any) => {
              if (!mockStore[collectionName]) mockStore[collectionName] = {};
              if (options?.merge) {
                mockStore[collectionName][docId] = { ...mockStore[collectionName][docId], ...data };
              } else {
                mockStore[collectionName][docId] = data;
              }
            },
            update: async (data: any) => {
              if (!mockStore[collectionName]) mockStore[collectionName] = {};
              mockStore[collectionName][docId] = { ...mockStore[collectionName][docId], ...data };
            },
          };
        },
        add: async (data: any) => {
          const id = "mock_id_" + Math.random().toString(36).substring(7);
          if (!mockStore[collectionName]) mockStore[collectionName] = {};
          mockStore[collectionName][id] = data;
          return { id };
        },
        where: (field: string, op: string, value: any) => {
          const docs = Object.entries(mockStore[collectionName] || {})
            .filter(([id, data]) => data[field] === value)
            .map(([id, data]) => ({
              id,
              data: () => data,
            }));
          return {
            get: async () => ({
              docs,
              empty: docs.length === 0,
            }),
          };
        },
      } as any;
    }
  };
  (globalThis as any).firestoreMock = mockDb;
}

function restoreFirestore() {
  (globalThis as any).firestoreMock = undefined;
}

// Tests
async function testFormatting() {
  // Test E164 formatting
  assert.strictEqual(formatE164("1234567890"), "+11234567890");
  assert.strictEqual(formatE164("+1 (555) 019-9999"), "+15550199999");

  // Test URL formatting for TTS speech
  assert.ok(formatUrlForSpeech("https://meet.google.com/abc-defg-hij").includes("Google Meet with code a b c d e f g h i j"));
  assert.strictEqual(formatUrlForSpeech("https://zoom.us/j/123"), "Zoom");
  assert.strictEqual(formatUrlForSpeech("https://teams.microsoft.com/l/meet"), "Microsoft Teams");
  assert.strictEqual(formatUrlForSpeech(""), "the link provided in your email");
}

async function testComplianceVerification() {
  resetMockStore();
  setupMockFirestore();

  const originalDate = globalThis.Date;
  const mockDaytime = new Date("2026-06-01T12:00:00.000Z");
  // @ts-ignore
  globalThis.Date = class extends originalDate {
    constructor(arg: any) {
      if (arg) {
        super(arg);
      } else {
        super(mockDaytime.getTime());
      }
    }
    static now() {
      return mockDaytime.getTime();
    }
  };

  try {
    // Test invalid phone number
    const res1 = await verifyCompliance("lead_1", "");
    assert.strictEqual(res1.allowed, false);
    assert.strictEqual(res1.reason, "invalid_phone_number");

    // Test opt-out
    mockStore.user_consent["lead_2"] = { purposes: ["opt-out"] };
    const res2 = await verifyCompliance("lead_2", "1234567890");
    assert.strictEqual(res2.allowed, false);
    assert.strictEqual(res2.reason, "opted_out");
  } finally {
    globalThis.Date = originalDate;
    restoreFirestore();
  }
}

async function testVoiceCallInitiationSuccess() {
  resetMockStore();
  setupMockFirestore();

  // Seed documents
  mockStore.leads["lead_ok"] = {
    contactName: "John",
    contactPhone: "1234567890",
    contactEmail: "john@example.com",
    companyName: "Acme Corp",
  };
  mockStore.calls["call_ok"] = {
    leadId: "lead_ok",
    scheduledAt: "2026-06-01T10:00:00.000Z",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  };

  // Mock Twilio credentials in environment
  process.env.TWILIO_ACCOUNT_SID = "AC_TEST";
  process.env.TWILIO_AUTH_TOKEN = "TOKEN_TEST";
  process.env.TWILIO_PHONE_NUMBER = "+15005550006";

  const originalFetch = globalThis.fetch;
  let fetchParams: any = null;

  globalThis.fetch = (async (url: any, init: any) => {
    fetchParams = { url, init };
    return {
      ok: true,
      status: 201,
      json: async () => ({ sid: "CA_MOCK_SID" }),
    } as any;
  }) as any;

  // Mock Date class to simulate daytime (12:00 PM UTC = 5:30 PM IST) to pass quiet hours check
  const originalDate = globalThis.Date;
  const mockDaytime = new Date("2026-06-01T12:00:00.000Z");
  // @ts-ignore
  globalThis.Date = class extends originalDate {
    constructor(arg: any) {
      if (arg) {
        super(arg);
      } else {
        super(mockDaytime.getTime());
      }
    }
    static now() {
      return mockDaytime.getTime();
    }
  };

  try {
    const res = await initiateVoiceCall("call_ok", 1);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.twilioCallSid, "CA_MOCK_SID");

    // Verify database voice confirmation document was created
    const voiceDoc = mockStore.voice_confirmations["call_ok"];
    assert.ok(voiceDoc);
    assert.strictEqual(voiceDoc.status, "initiated");
    assert.strictEqual(voiceDoc.attemptsCount, 1);
    assert.strictEqual(voiceDoc.attempts.length, 1);
    assert.strictEqual(voiceDoc.attempts[0].twilioCallSid, "CA_MOCK_SID");

    // Verify twilio request contents
    assert.ok(fetchParams);
    assert.strictEqual(fetchParams.url, "https://api.twilio.com/2010-04-01/Accounts/AC_TEST/Calls.json");
    const bodyStr = fetchParams.init.body.toString();
    assert.ok(bodyStr.includes("To=%2B11234567890"));
    assert.ok(bodyStr.includes("From=%2B15005550006"));
    assert.ok(bodyStr.includes("Twiml="));
    assert.ok(bodyStr.includes("StatusCallback="));
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Date = originalDate;
    restoreFirestore();
  }
}

async function testVoiceCallFailureRetry() {
  resetMockStore();
  setupMockFirestore();

  mockStore.leads["lead_fail"] = {
    contactName: "Sarah",
    contactPhone: "1234567890",
    contactEmail: "sarah@example.com",
    companyName: "Acme Corp",
  };
  mockStore.calls["call_fail"] = {
    leadId: "lead_fail",
    scheduledAt: "2026-06-01T10:00:00.000Z",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  };

  mockStore.voice_confirmations["call_fail"] = {
    callId: "call_fail",
    leadId: "lead_fail",
    phone: "+11234567890",
    status: "initiated",
    attemptsCount: 1,
    maxAttempts: 3,
    attempts: [{ attempt: 1, twilioCallSid: "CA_FAIL", status: "initiated" }],
  };

  // Mock setTimeout to fire immediately rather than wait 5 mins
  const originalSetTimeout = globalThis.setTimeout;
  let timerCallback: any = null;
  // @ts-ignore
  globalThis.setTimeout = (cb: any, delay: number) => {
    timerCallback = cb;
    return 123 as any;
  };

  try {
    await handleCallFailure("call_fail", "busy");

    // Check status is set to failed
    const voiceDoc = mockStore.voice_confirmations["call_fail"];
    assert.strictEqual(voiceDoc.status, "failed");

    // Verify retry was scheduled
    assert.ok(timerCallback);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    restoreFirestore();
  }
}

async function testVoiceCallFallback() {
  resetMockStore();
  setupMockFirestore();

  mockStore.leads["lead_fallback"] = {
    contactName: "David",
    contactPhone: "1234567890",
    contactEmail: "david@example.com",
    companyName: "Acme Corp",
  };
  mockStore.calls["call_fallback"] = {
    leadId: "lead_fallback",
    scheduledAt: "2026-06-01T10:00:00.000Z",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  };

  mockStore.voice_confirmations["call_fallback"] = {
    callId: "call_fallback",
    leadId: "lead_fallback",
    phone: "+11234567890",
    status: "failed",
    attemptsCount: 3,
    maxAttempts: 3,
    attempts: [],
    fallbackSent: false,
  };

  const originalFetch = globalThis.fetch;
  const emailsSent: any[] = [];
  const smsSent: any[] = [];

  globalThis.fetch = (async (url: any, init: any) => {
    if (url.includes("api.resend.com")) {
      emailsSent.push(JSON.parse(init.body));
      return { ok: true, json: async () => ({ id: "email_sent" }) } as any;
    }
    if (url.includes("api.twilio.com")) {
      smsSent.push(init.body);
      return { ok: true, json: async () => ({ sid: "sms_sent" }) } as any;
    }
    return { ok: true } as any;
  }) as any;

  process.env.RESEND_API_KEY = "re_test";
  process.env.TWILIO_ACCOUNT_SID = "AC_TEST";
  process.env.TWILIO_AUTH_TOKEN = "TOKEN_TEST";
  process.env.TWILIO_PHONE_NUMBER = "+15005550006";

  try {
    await triggerVoiceFallback("call_fallback", "max_attempts_exceeded");

    // Verify database updated
    const voiceDoc = mockStore.voice_confirmations["call_fallback"];
    assert.strictEqual(voiceDoc.fallbackSent, true);
    assert.strictEqual(voiceDoc.fallbackType, "email_and_sms");

    // Verify email and SMS were dispatched
    assert.strictEqual(emailsSent.length, 1);
    assert.strictEqual(emailsSent[0].to, "david@example.com");
    assert.ok(emailsSent[0].html.includes("We tried calling you to confirm, but were unable to connect."));

    assert.strictEqual(smsSent.length, 1);
    const smsParams = smsSent[0].toString();
    assert.ok(smsParams.includes("david%40example.com") === false); // SMS should not contain the email
    assert.ok(smsParams.includes("David")); // SMS should contain David's name
    assert.ok(smsParams.includes("To=%2B11234567890")); // SMS should be addressed to the correct phone number
  } finally {
    globalThis.fetch = originalFetch;
    restoreFirestore();
  }
}

export async function runVoiceConfirmationTests() {
  console.log("=========================================");
  console.log(" Voice Call Confirmation Unit Tests");
  console.log("=========================================");
  
  const tests = [
    testFormatting,
    testComplianceVerification,
    testVoiceCallInitiationSuccess,
    testVoiceCallFailureRetry,
    testVoiceCallFallback,
  ];

  for (const t of tests) {
    try {
      await t();
      console.log(`✅ Passed: ${t.name}`);
    } catch (e: any) {
      console.error(`❌ Failed: ${t.name}`);
      throw e;
    }
  }
  console.log("=========================================\n");
}
