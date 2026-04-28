// lib/elevenlabs.ts
import { PERSONAS } from '@/prompts/personas';

export const PERSONA_VOICES: Record<string, string | undefined> = {
  alex: process.env.ELEVENLABS_VOICE_ALEX,
  sam: process.env.ELEVENLABS_VOICE_SAM,
  jordan: process.env.ELEVENLABS_VOICE_JORDAN,
  casey: process.env.ELEVENLABS_VOICE_CASEY,
};

export async function textToSpeech(text: string, personaKey: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = PERSONA_VOICES[personaKey] || PERSONA_VOICES.alex;

  if (!voiceId) {
    throw new Error(`Voice ID not found for persona: ${personaKey}`);
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ElevenLabs API error: ${error.detail?.message || response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
