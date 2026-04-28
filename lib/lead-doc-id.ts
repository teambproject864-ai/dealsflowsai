/** Stable Firestore document id per lead (one doc per contact email). */
export function leadDocIdFromEmail(
  email: string | null | undefined
): string {
  if (!email || typeof email !== "string" || !email.trim()) {
    return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  return email.trim().toLowerCase();
}
