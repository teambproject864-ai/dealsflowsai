// prompts/note-taker.ts
export const NOTE_TAKER_PROMPT = `
Extract key moments, objections, buying signals, and action items from the provided transcript segment.
Return a structured JSON object.
`;

// prompts/deal-closer.ts
export const DEAL_CLOSER_PROMPT = `
Analyze the conversation and determine if it's the right time to close the deal.
Identify buying signals and suggest a closing statement.
`;

// prompts/objection-handler.ts
export const OBJECTION_HANDLER_PROMPT = `
Identify any objections in the user's statement and provide a consultative, confident response as a Dealflow.ai representative.
`;

// prompts/summary-generator.ts
export const SUMMARY_GENERATOR_PROMPT = `
Generate a comprehensive post-call summary including pain points, solutions, key moments, and next steps.
`;
