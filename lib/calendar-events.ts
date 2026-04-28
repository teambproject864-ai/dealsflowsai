import crypto from "crypto";
import { google } from "googleapis";
import { loadServiceAccount } from "@/lib/service-account";
import { parseIcsDate, parseIcsEvents } from "@/lib/ics";

export type CalendarEvent = {
  source: "ics" | "google";
  calendarId: string;
  eventId: string;
  uid?: string;
  title: string;
  start: Date;
  end: Date;
  meetingUrl: string | null;
  raw: any;
};

export function extractConferenceUrl(text: string): string | null {
  if (!text) return null;
  const urlRegex =
    /(https?:\/\/(?:meet\.google\.com\/[^\s<]+|zoom\.us\/j\/[^\s<]+|teams\.microsoft\.com\/l\/meetup-join\/[^\s<]+|webex\.com\/[^\s<]+|gotomeeting\.com\/join\/[^\s<]+|whereby\.com\/[^\s<]+|bluejeans\.com\/[^\s<]+))/i;
  const m = text.match(urlRegex);
  return m ? m[1] : null;
}

export function computeJoinKey(ev: Pick<CalendarEvent, "calendarId" | "eventId" | "start">) {
  const input = `${ev.calendarId}:${ev.eventId}:${ev.start.toISOString()}`;
  return crypto.createHash("sha1").update(input).digest("hex");
}

export function selectJoinCandidates(
  events: CalendarEvent[],
  now: Date,
  joinEarlySeconds: number,
  joinLateSeconds: number
) {
  const nowMs = now.getTime();
  return events.filter((e) => {
    const startMs = e.start.getTime();
    const open = startMs - joinEarlySeconds * 1000;
    const close = startMs + joinLateSeconds * 1000;
    return nowMs >= open && nowMs <= close;
  });
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow", cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

export async function fetchIcsCalendarEvents(args: {
  calendarId: string;
  icsUrl: string;
  now: Date;
  lookAheadMinutes: number;
}): Promise<CalendarEvent[]> {
  const res = await fetchWithTimeout(args.icsUrl, 12000);
  const body = await res.text().catch(() => "");
  if (!res.ok) {
    const snippet = body.slice(0, 300);
    throw new Error(`ics_fetch_failed:${res.status}:${snippet}`);
  }
  const icsEvents = parseIcsEvents(body);
  const maxEnd = new Date(args.now.getTime() + args.lookAheadMinutes * 60 * 1000);

  const out: CalendarEvent[] = [];
  for (const e of icsEvents) {
    const start = parseIcsDate(e.dtStart);
    const end = parseIcsDate(e.dtEnd) || (start ? new Date(start.getTime() + 30 * 60 * 1000) : null);
    if (!start || !end) continue;
    if (start < new Date(args.now.getTime() - 5 * 60 * 1000)) continue;
    if (start > maxEnd) continue;

    const meetingUrl =
      extractConferenceUrl(e.location || "") ||
      extractConferenceUrl(e.description || "") ||
      extractConferenceUrl(e.url || "") ||
      null;

    out.push({
      source: "ics",
      calendarId: args.calendarId,
      eventId: e.uid || `${start.toISOString()}_${(e.summary || "event").slice(0, 20)}`,
      uid: e.uid,
      title: e.summary || "Calendar event",
      start,
      end,
      meetingUrl,
      raw: e,
    });
  }
  return out;
}

function getCalendarClient() {
  const sa = loadServiceAccount();
  if (!sa) throw new Error("Google credentials missing");
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
  return google.calendar({ version: "v3", auth });
}

export async function fetchGoogleCalendarEvents(args: {
  calendarId: string;
  now: Date;
  lookAheadMinutes: number;
}): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();
  const timeMin = new Date(args.now.getTime() - 5 * 60 * 1000);
  const timeMax = new Date(args.now.getTime() + args.lookAheadMinutes * 60 * 1000);

  const res = await calendar.events.list({
    calendarId: args.calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  const items = res.data.items || [];
  const out: CalendarEvent[] = [];

  for (const item of items) {
    const startIso = item.start?.dateTime || (item.start?.date ? `${item.start.date}T00:00:00Z` : null);
    const endIso = item.end?.dateTime || (item.end?.date ? `${item.end.date}T00:00:00Z` : null);
    if (!startIso || !endIso) continue;
    const start = new Date(startIso);
    const end = new Date(endIso);

    const confUrl =
      item.hangoutLink ||
      item.conferenceData?.entryPoints?.find((p: any) => p?.uri)?.uri ||
      null;

    const meetingUrl =
      (confUrl ? confUrl : null) ||
      extractConferenceUrl(item.location || "") ||
      extractConferenceUrl(item.description || "") ||
      null;

    const eventId = item.id || item.iCalUID || `${start.toISOString()}_${(item.summary || "event").slice(0, 20)}`;

    out.push({
      source: "google",
      calendarId: args.calendarId,
      eventId,
      uid: item.iCalUID || undefined,
      title: item.summary || "Calendar event",
      start,
      end,
      meetingUrl,
      raw: item,
    });
  }

  return out;
}

export async function checkMeetingUrlReachable(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetchWithTimeout(url, 8000);
    return { ok: res.ok, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || "fetch_failed" };
  }
}
