export type IcsEvent = {
  uid?: string;
  summary?: string;
  description?: string;
  location?: string;
  url?: string;
  dtStart?: string;
  dtEnd?: string;
};

function unfoldLines(raw: string): string[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (!line) {
      out.push(line);
      continue;
    }
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function getValue(line: string): { key: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  const left = line.slice(0, idx);
  const value = line.slice(idx + 1);
  const key = left.split(";")[0].trim().toUpperCase();
  return { key, value: value.trim() };
}

export function parseIcsEvents(raw: string): IcsEvent[] {
  const lines = unfoldLines(raw);
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;
  for (const line of lines) {
    const upper = line.trim().toUpperCase();
    if (upper === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (upper === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const kv = getValue(line);
    if (!kv) continue;
    if (kv.key === "UID") current.uid = kv.value;
    else if (kv.key === "SUMMARY") current.summary = kv.value;
    else if (kv.key === "DESCRIPTION") current.description = kv.value;
    else if (kv.key === "LOCATION") current.location = kv.value;
    else if (kv.key === "URL") current.url = kv.value;
    else if (kv.key === "DTSTART") current.dtStart = kv.value;
    else if (kv.key === "DTEND") current.dtEnd = kv.value;
  }
  return events;
}

export function parseIcsDate(dt: string | undefined | null): Date | null {
  if (!dt) return null;
  const s = dt.trim();
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return null;
  const [, yy, mm, dd, hh, mi, ss, z] = m;
  const y = Number(yy);
  const mo = Number(mm) - 1;
  const d = Number(dd);
  const h = Number(hh);
  const mn = Number(mi);
  const sec = Number(ss);
  if (z) return new Date(Date.UTC(y, mo, d, h, mn, sec));
  return new Date(y, mo, d, h, mn, sec);
}

