import { google } from "googleapis";
import crypto from "crypto";
import { loadServiceAccount } from "@/lib/service-account";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

type CreateMeetArgs = {
  title: string;
  descriptionHtml: string;
  start: Date;
  end: Date;
  timeZone?: string;
};

function getCalendarClient() {
  const sa = loadServiceAccount();
  if (!sa) throw new Error("Google credentials missing");

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [CALENDAR_SCOPE],
  });

  return google.calendar({ version: "v3", auth });
}

function getCalendarId() {
  const id = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!id) {
    console.warn("GOOGLE_CALENDAR_ID is missing, falling back to 'primary'");
    return "primary";
  }
  return id;
}

export async function createGoogleMeetLink(args: CreateMeetArgs): Promise<{
  meetLink: string;
  eventId: string;
  htmlLink?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();
  const timeZone = args.timeZone || process.env.GOOGLE_CALENDAR_TIMEZONE || "UTC";
  const requestId = crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");

  const res = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: args.title,
      description: args.descriptionHtml,
      start: { dateTime: args.start.toISOString(), timeZone },
      end: { dateTime: args.end.toISOString(), timeZone },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink = res.data.hangoutLink;
  const eventId = res.data.id;

  if (!meetLink || !eventId) {
    throw new Error("Google Calendar did not return a Meet link");
  }

  return { meetLink, eventId, htmlLink: res.data.htmlLink || undefined };
}

export type CalendarAttendeeStatus = {
  email: string;
  responseStatus?: string;
  optional?: boolean;
};

export function extractAttendeeStatuses(event: any): CalendarAttendeeStatus[] {
  const atts = Array.isArray(event?.attendees) ? event.attendees : [];
  return atts
    .map((a: any) => ({
      email: String(a?.email || "").trim().toLowerCase(),
      responseStatus: a?.responseStatus ? String(a.responseStatus) : undefined,
      optional: typeof a?.optional === "boolean" ? a.optional : undefined,
    }))
    .filter((a: CalendarAttendeeStatus) => a.email);
}

export async function fetchGoogleCalendarEvent(args: {
  eventId: string;
  calendarId?: string;
}): Promise<{
  id: string;
  htmlLink?: string;
  summary?: string;
  start?: string;
  end?: string;
  attendees: CalendarAttendeeStatus[];
}> {
  const calendar = getCalendarClient();
  const calendarId = args.calendarId?.trim() || getCalendarId();

  const res = await calendar.events.get({
    calendarId,
    eventId: args.eventId,
  });

  const ev: any = res.data || {};
  const start = ev?.start?.dateTime || ev?.start?.date || undefined;
  const end = ev?.end?.dateTime || ev?.end?.date || undefined;

  return {
    id: String(ev.id || args.eventId),
    htmlLink: ev.htmlLink || undefined,
    summary: ev.summary || undefined,
    start: start ? String(start) : undefined,
    end: end ? String(end) : undefined,
    attendees: extractAttendeeStatuses(ev),
  };
}
