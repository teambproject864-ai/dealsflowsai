import crypto from "crypto";

export type TranscriptSegmentLike = {
  speaker?: string;
  text?: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function hashRecipient(value: string): string {
  const v = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(v).digest("hex");
}

export function redactMeetingLink(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    const s = u.toString();
    return s.length > 180 ? `${s.slice(0, 180)}…` : s;
  } catch {
    const trimmed = (url || "").trim();
    return trimmed.length > 180 ? `${trimmed.slice(0, 180)}…` : trimmed;
  }
}

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

export function detectNoShow(args: {
  segments: TranscriptSegmentLike[];
  agentName?: string;
  minHumanSegments?: number;
}): { noShow: boolean; humanSegments: number; humanSpeakers: number } {
  const agent = args.agentName ? normalize(args.agentName) : "";
  const minHumanSegments = Number.isFinite(args.minHumanSegments) ? Math.max(0, args.minHumanSegments!) : 1;

  const humanSpeakerSet = new Set<string>();
  let humanSegments = 0;

  for (const seg of args.segments || []) {
    const speakerRaw = String(seg?.speaker || "").trim();
    const textRaw = String(seg?.text || "").trim();
    if (!speakerRaw && !textRaw) continue;

    const speaker = normalize(speakerRaw);
    const text = textRaw;

    const isAgent =
      (agent && speaker.includes(agent)) ||
      speaker.includes("(ai)") ||
      speaker.includes("dealflow.ai") ||
      speaker.includes("dealflow") ||
      speaker.includes("praneeth assist");

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const isMeaningful = wordCount >= 4;

    if (!isAgent && isMeaningful) {
      humanSegments += 1;
      if (speaker) humanSpeakerSet.add(speaker);
    }
  }

  return {
    noShow: humanSegments < minHumanSegments,
    humanSegments,
    humanSpeakers: humanSpeakerSet.size,
  };
}

