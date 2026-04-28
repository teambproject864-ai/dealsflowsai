/** Cal.com embed expects `username/event`, not a full URL. */
export function normalizeCalLink(raw: string | undefined | null): string | undefined {
  if (!raw?.trim()) return undefined;
  let s = raw.trim();
  s = s.replace(/^https?:\/\/(www\.)?cal\.com\//i, "");
  s = s.replace(/^\/+/, "");
  return s || undefined;
}
