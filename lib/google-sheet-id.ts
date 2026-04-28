/**
 * Accepts either a raw spreadsheet id or a full Google Sheets URL and returns the id.
 * @see https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
 */
export function parseGoogleSheetId(
  raw: string | undefined | null
): string | undefined {
  if (!raw?.trim()) return undefined;
  let s = raw.trim();
  // Strip wrapping quotes from .env
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  const fromUrl = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl?.[1]) return fromUrl[1];
  if (/^[a-zA-Z0-9-_]+$/.test(s)) return s;
  return undefined;
}
