// Utilities for meeting platform identification and validation

export type MeetingPlatform = 'zoom' | 'google_meet' | 'microsoft_teams' | 'other';

export function identifyMeetingPlatform(url: string): MeetingPlatform {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('zoom.us')) {
    return 'zoom';
  }
  if (lowercaseUrl.includes('meet.google.com')) {
    return 'google_meet';
  }
  if (lowercaseUrl.includes('teams.microsoft.com') || lowercaseUrl.includes('teams.live.com')) {
    return 'microsoft_teams';
  }
  
  return 'other';
}

export function isValidMeetingUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Basic protocol check
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    // Basic domain check (should have at least one dot)
    if (!parsedUrl.hostname.includes('.')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
