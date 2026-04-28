import assert from "assert";
import { parseIcsEvents, parseIcsDate } from "@/lib/ics";
import { extractConferenceUrl, selectJoinCandidates } from "@/lib/calendar-events";
import { createMeetingBot } from "@/lib/recall";
import { computeJoinAtIso, isUnhealthyBotStatus } from "@/lib/call-bot";
import { hfInferJSON } from "@/lib/huggingface";
import { createCallSchema } from "@/lib/types";
import { detectNoShow, interpolateTemplate, redactMeetingLink } from "@/lib/post-meeting";
import { extractAttendeeStatuses } from "@/lib/google-meet";
import {
  testRagAnswerUsesStubInfer,
  testRagAnswerUsesNvidiaProviderWithStubbedFetch,
  testRagChunkingOverlap,
  testNvidiaChatCompletionStreamParsesTokens,
  testRagParseTxt,
  testRagSearchMappingWithStubs,
} from "@/tests/rag.test";

async function testIcsParsing() {
  const raw = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:abc123",
    "SUMMARY:Demo Call",
    "DTSTART:20260101T100000Z",
    "DTEND:20260101T103000Z",
    "LOCATION:https://meet.google.com/abc-defg-hij",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const events = parseIcsEvents(raw);
  assert.equal(events.length, 1);
  assert.equal(events[0].uid, "abc123");
  assert.equal(events[0].summary, "Demo Call");
  assert.equal(events[0].location, "https://meet.google.com/abc-defg-hij");

  const dt = parseIcsDate(events[0].dtStart);
  assert.ok(dt instanceof Date);
  assert.equal(dt?.toISOString(), "2026-01-01T10:00:00.000Z");
}

async function testUrlExtraction() {
  const url = extractConferenceUrl("Join here: https://teams.microsoft.com/l/meetup-join/abc123?foo=bar");
  assert.ok(url);
  assert.ok(url?.includes("teams.microsoft.com/l/meetup-join/"));
}

async function testJoinWindowSelection() {
  const now = new Date("2026-01-01T09:59:30.000Z");
  const evs: any[] = [
    {
      source: "ics",
      calendarId: "c",
      eventId: "e1",
      title: "t",
      start: new Date("2026-01-01T10:00:00.000Z"),
      end: new Date("2026-01-01T10:30:00.000Z"),
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      raw: {},
    },
  ];
  const candidates = selectJoinCandidates(evs, now, 90, 300);
  assert.equal(candidates.length, 1);
}

async function testRecallJoinAtPayload() {
  const calls: any[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (url: any, init: any) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ id: "bot_123" }),
      text: async () => "",
    } as any;
  }) as any;

  process.env.RECALL_API_KEY = "test";
  process.env.APP_URL = "http://localhost:3000";
  process.env.SCREEN_SHARE_WORKER_URL = "http://localhost:7777";

  await createMeetingBot("https://meet.google.com/abc-defg-hij", "Praneeth Assist", "call_123", "2026-01-01T10:00:00.000Z");

  globalThis.fetch = originalFetch;

  assert.ok(calls.length >= 1);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.meeting_url, "https://meet.google.com/abc-defg-hij");
  assert.equal(body.join_at, "2026-01-01T10:00:00.000Z");
}

async function testBotJoinWithin5SecondsForImmediateCall() {
  const now = new Date("2026-01-01T10:00:00.000Z");
  const joinAt = computeJoinAtIso({
    callMode: "immediate",
    status: "in-progress",
    scheduledAt: now,
    now,
    forceJoinNow: true,
  });
  assert.ok(joinAt);
  const delta = new Date(joinAt!).getTime() - now.getTime();
  assert.ok(delta >= 0 && delta <= 5000);
}

async function testBotJoinForScheduledCallDoesNotBackdate() {
  const now = new Date("2026-01-01T10:00:00.000Z");
  const scheduledAt = new Date("2026-01-01T10:10:00.000Z");
  const joinAt = computeJoinAtIso({
    callMode: "scheduled",
    status: "scheduled",
    scheduledAt,
    now,
    joinEarlySeconds: 60,
  });
  assert.ok(joinAt);
  assert.ok(new Date(joinAt!).getTime() >= now.getTime());
}

async function testBotHealthStatusClassifier() {
  assert.equal(isUnhealthyBotStatus("joined_call"), false);
  assert.equal(isUnhealthyBotStatus("failed"), true);
  assert.equal(isUnhealthyBotStatus("done"), true);
}

import { checkSchedulingConditions } from "@/lib/daily-email-scheduler";

async function testDailySchedulerIST7PM() {
  // Mock 7 PM IST
  const ist7PM = new Date("2026-04-29T13:30:00.000Z"); // 13:30 UTC = 19:00 IST
  const originalDate = globalThis.Date;
  
  // @ts-ignore
  globalThis.Date = class extends originalDate {
    constructor(arg: any) {
      super(arg || ist7PM.getTime());
    }
  };

  const { shouldRun } = checkSchedulingConditions();
  globalThis.Date = originalDate;

  assert.equal(shouldRun, true, "Should trigger at 7 PM IST");
}

async function testHfInferJsonLenientTrailingCommas() {
  const out = (await hfInferJSON(
    "p",
    "s",
    async () =>
      "```json\n{\n  \"a\": [1, 2,],\n  \"b\": {\"c\": 3,},\n}\n```"
  )) as any;

  assert.deepEqual(out, { a: [1, 2], b: { c: 3 } });
}

async function testCreateCallSchemaAllowsMissingAnalysisId() {
  const parsed = createCallSchema.parse({
    leadId: "lead_123",
    meetingUrl: "https://cal.com/x/y",
    scheduledAt: new Date().toISOString(),
  });
  assert.equal(parsed.analysisId, "");
}

async function testNoShowDetection() {
  const empty = detectNoShow({ segments: [] });
  assert.equal(empty.noShow, true);

  const joined = detectNoShow({
    segments: [
      { speaker: "Praneeth Assist (AI) | Dealflow.ai", text: "Hello there and welcome to Dealflow." },
      { speaker: "John Doe", text: "Thanks for taking the time today, looking forward to it." },
    ],
  });
  assert.equal(joined.noShow, false);
}

async function testTemplateInterpolationAndRedaction() {
  const subject = interpolateTemplate("pls join the meeting and {{meetingLink}}", {
    meetingLink: redactMeetingLink("https://meet.google.com/abc-defg-hij?authuser=1"),
  });
  assert.ok(subject.includes("https://meet.google.com/abc-defg-hij"));
  assert.ok(!subject.includes("authuser=1"));
}

async function testExtractAttendeeStatuses() {
  const out = extractAttendeeStatuses({
    attendees: [
      { email: "User@Example.com", responseStatus: "accepted" },
      { email: "  ", responseStatus: "needsAction" },
    ],
  } as any);
  assert.deepEqual(out, [{ email: "user@example.com", responseStatus: "accepted", optional: undefined }]);
}

async function main() {
  const tests = [
    testIcsParsing,
    testUrlExtraction,
    testJoinWindowSelection,
    testRecallJoinAtPayload,
    testBotJoinWithin5SecondsForImmediateCall,
    testBotJoinForScheduledCallDoesNotBackdate,
    testBotHealthStatusClassifier,
    testDailySchedulerIST7PM,
    testHfInferJsonLenientTrailingCommas,
    testCreateCallSchemaAllowsMissingAnalysisId,
    testNoShowDetection,
    testTemplateInterpolationAndRedaction,
    testExtractAttendeeStatuses,
    testRagChunkingOverlap,
    testRagParseTxt,
    testRagSearchMappingWithStubs,
    testRagAnswerUsesStubInfer,
    testRagAnswerUsesNvidiaProviderWithStubbedFetch,
    testNvidiaChatCompletionStreamParsesTokens,
  ];

  for (const t of tests) {
    await t();
    process.stdout.write(`ok ${t.name}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
