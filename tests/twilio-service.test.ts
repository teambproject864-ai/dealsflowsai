// tests/twilio-service.test.ts
import assert from "assert";
import { db } from "@/lib/firebase-admin";
import { TwilioService } from "@/lib/twilio-service";

// Backup original db.collection (may be null in CI where no service account is configured)
const originalCollection = db?.collection ?? null;
let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    otps: {},
    twilio_delivery_statuses: {},
    audit_logs: {},
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
      } as any;
    }
  };
  (globalThis as any).firestoreMock = mockDb;
}

function restoreFirestore() {
  (globalThis as any).firestoreMock = undefined;
}

// Mock standard credentials in environment to initialize class safely
process.env.TWILIO_ACCOUNT_SID = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
process.env.TWILIO_AUTH_TOKEN = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
process.env.TWILIO_PHONE_NUMBER = "+15017122661";

const service = TwilioService.getInstance();
const originalClient = service["client"];

let mockClientParams: { messages: any[]; calls: any[] } = { messages: [], calls: [] };

function setupMockTwilioSDK() {
  mockClientParams = { messages: [], calls: [] };
  service["client"] = {
    messages: {
      create: async (params: any) => {
        mockClientParams.messages.push(params);
        return {
          sid: "SM_MOCK_SID_" + Math.random().toString(36).substring(7),
          status: "queued",
        };
      },
    },
    calls: {
      create: async (params: any) => {
        mockClientParams.calls.push(params);
        return {
          sid: "CA_MOCK_SID_" + Math.random().toString(36).substring(7),
          status: "queued",
        };
      },
    },
  } as any;
}

function restoreTwilioSDK() {
  service["client"] = originalClient;
}

// Tests
async function testSendSMS() {
  resetMockStore();
  setupMockFirestore();
  setupMockTwilioSDK();

  try {
    const to = "+15550199999";
    const msg = "Hello from Dealflow.ai test suite!";
    
    const result = await service.sendSMS(to, msg);
    
    assert.ok(result.sid.startsWith("SM_MOCK_SID_"));
    assert.strictEqual(result.status, "queued");

    // Verify parameter mapping
    assert.strictEqual(mockClientParams.messages.length, 1);
    assert.strictEqual(mockClientParams.messages[0].to, to);
    assert.strictEqual(mockClientParams.messages[0].body, msg);
    assert.ok(mockClientParams.messages[0].statusCallback.includes("/api/twilio/status-callback?channel=sms"));

    // Verify delivery status collection initialized
    const statusRecord = mockStore.twilio_delivery_statuses[result.sid];
    assert.ok(statusRecord);
    assert.strictEqual(statusRecord.channel, "sms");
    assert.strictEqual(statusRecord.status, "queued");
    assert.strictEqual(statusRecord.to, to);
  } finally {
    restoreFirestore();
    restoreTwilioSDK();
  }
}

async function testSendWhatsApp() {
  resetMockStore();
  setupMockFirestore();
  setupMockTwilioSDK();

  try {
    const to = "5550199999"; // raw format
    const msg = "WhatsApp test message!";
    
    const result = await service.sendWhatsApp(to, msg);
    
    assert.ok(result.sid.startsWith("SM_MOCK_SID_"));

    // Verify WhatsApp protocol prefixes added
    assert.strictEqual(mockClientParams.messages.length, 1);
    assert.strictEqual(mockClientParams.messages[0].to, "whatsapp:+15550199999");
    assert.strictEqual(mockClientParams.messages[0].from, "whatsapp:+15017122661");
    assert.strictEqual(mockClientParams.messages[0].body, msg);

    // Verify delivery status initialized
    const statusRecord = mockStore.twilio_delivery_statuses[result.sid];
    assert.ok(statusRecord);
    assert.strictEqual(statusRecord.channel, "whatsapp");
    assert.strictEqual(statusRecord.to, "whatsapp:+15550199999");
  } finally {
    restoreFirestore();
    restoreTwilioSDK();
  }
}

async function testInitiateVoiceCall() {
  resetMockStore();
  setupMockFirestore();
  setupMockTwilioSDK();

  try {
    const to = "+15550199999";
    const twiml = "<Response><Say>Test Voice Call</Say></Response>";
    
    const result = await service.initiateVoiceCall(to, twiml);
    
    assert.ok(result.sid.startsWith("CA_MOCK_SID_"));

    // Verify parameter mapping
    assert.strictEqual(mockClientParams.calls.length, 1);
    assert.strictEqual(mockClientParams.calls[0].to, to);
    assert.strictEqual(mockClientParams.calls[0].twiml, twiml);
    assert.ok(mockClientParams.calls[0].statusCallback.includes("/api/twilio/status-callback?channel=voice"));

    // Verify delivery status initialized
    const statusRecord = mockStore.twilio_delivery_statuses[result.sid];
    assert.ok(statusRecord);
    assert.strictEqual(statusRecord.channel, "voice");
  } finally {
    restoreFirestore();
    restoreTwilioSDK();
  }
}

async function testOTPEngineWorkflow() {
  resetMockStore();
  setupMockFirestore();
  setupMockTwilioSDK();

  try {
    const to = "+15550199999";

    // 1. Generate OTP
    const genRes = await service.generateOTP(to);
    assert.strictEqual(genRes.success, true);
    
    // Check Firestore doc created
    const otpDoc = mockStore.otps[to];
    assert.ok(otpDoc);
    assert.strictEqual(otpDoc.phone, to);
    assert.strictEqual(otpDoc.attempts, 0);
    assert.strictEqual(otpDoc.verified, false);
    assert.strictEqual(otpDoc.code.length, 6); // Numeric code size

    // SMS sent
    assert.strictEqual(mockClientParams.messages.length, 1);
    assert.ok(mockClientParams.messages[0].body.includes(otpDoc.code));

    // 2. Verify OTP Invalid code
    const verifyFailed = await service.verifyOTP(to, "000000");
    assert.strictEqual(verifyFailed.success, false);
    assert.strictEqual(verifyFailed.reason, "invalid_code");
    assert.strictEqual(mockStore.otps[to].attempts, 1);

    // 3. Verify OTP success
    const verifySuccess = await service.verifyOTP(to, otpDoc.code);
    assert.strictEqual(verifySuccess.success, true);
    assert.strictEqual(mockStore.otps[to].verified, true);

    // 4. Verify OTP already used
    const verifyUsed = await service.verifyOTP(to, otpDoc.code);
    assert.strictEqual(verifyUsed.success, false);
    assert.strictEqual(verifyUsed.reason, "otp_already_used");

    // 5. Verify OTP expired check
    resetMockStore();
    mockStore.otps[to] = {
      phone: to,
      code: "123456",
      expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      attempts: 0,
      verified: false,
    };
    const verifyExpired = await service.verifyOTP(to, "123456");
    assert.strictEqual(verifyExpired.success, false);
    assert.strictEqual(verifyExpired.reason, "otp_expired");

    // 6. Verify brute force lockout throttling (Attempts >= 3)
    resetMockStore();
    mockStore.otps[to] = {
      phone: to,
      code: "123456",
      expiresAt: new Date(Date.now() + 50000).toISOString(),
      attempts: 2,
      verified: false,
    };
    
    // Attempt 3 fails
    const fail3 = await service.verifyOTP(to, "000000");
    assert.strictEqual(fail3.success, false);
    assert.strictEqual(fail3.reason, "maximum_attempts_exceeded");
    
    // Attempt 4 even with correct code gets locked out
    const fail4 = await service.verifyOTP(to, "123456");
    assert.strictEqual(fail4.success, false);
    assert.strictEqual(fail4.reason, "maximum_attempts_exceeded");
  } finally {
    restoreFirestore();
    restoreTwilioSDK();
  }
}

async function testDeliveryStatusWebhooks() {
  resetMockStore();
  setupMockFirestore();
  setupMockTwilioSDK();

  try {
    const sid = "SM_MOCK_SID_ABC123";
    
    // Seed status record
    mockStore.twilio_delivery_statuses[sid] = {
      messageSid: sid,
      status: "queued",
    };

    // Invoke update
    await service.updateDeliveryStatus(sid, "delivered", "0", "delivered successfully", 0, "0.0075", "USD");

    // Check status document updated
    const statusRecord = mockStore.twilio_delivery_statuses[sid];
    assert.strictEqual(statusRecord.status, "delivered");
    assert.strictEqual(statusRecord.errorCode, "0");
    assert.strictEqual(statusRecord.errorMessage, "delivered successfully");
    assert.strictEqual(statusRecord.price, "0.0075");

    // Check Audit log written
    const auditLogs = Object.values(mockStore.audit_logs || {});
    assert.strictEqual(auditLogs.length, 1);
    assert.strictEqual(auditLogs[0].type, "twilio_delivery_update");
    assert.strictEqual(auditLogs[0].messageSid, sid);
    assert.strictEqual(auditLogs[0].status, "delivered");
  } finally {
    restoreFirestore();
    restoreTwilioSDK();
  }
}

export async function runTwilioServiceTests() {
  console.log("=========================================");
  console.log(" Twilio SDK Integration & Communications Tests");
  console.log("=========================================");
  
  const tests = [
    testSendSMS,
    testSendWhatsApp,
    testInitiateVoiceCall,
    testOTPEngineWorkflow,
    testDeliveryStatusWebhooks,
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
