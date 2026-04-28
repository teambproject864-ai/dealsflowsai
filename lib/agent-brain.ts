// lib/agent-brain.ts
import { hfInferJSON } from '@/lib/huggingface';
import { PERSONAS } from '@/prompts/personas';
import { retrieveMemories, storeMemory } from './alma';
import { applyVeritasTrustLayer } from './veritas';
import { extractKeywords } from './mempalace';
import type { MemoryCategory } from './types';

export interface AgentAction {
  action: 'speak' | 'show_screen' | 'send_email' | 'book_followup' | 'close_deal' | 'handle_objection';
  content: string;
  navigate_to?: string | null;
  stage_update: 'intro' | 'discovery' | 'demo' | 'objection' | 'closing' | 'closed';
  buyingSignal: boolean;
  objectionDetected: boolean;
  dealProbability: number;
  new_learning?: {
    category: MemoryCategory;
    content: string;
    importance: number;
  } | null;
}

export async function agentDecide(
  recentTranscript: string[],
  companyContext: any,
  personaKey: string,
  currentStage: string,
  leadId: string,
  sessionId?: string
): Promise<AgentAction> {
  const persona = (PERSONAS as any)[personaKey] || PERSONAS.praneeth_assist;
  const systemPrompt = persona.systemPrompt(companyContext);

  // Retrieve relevant memories from ALMA (Episodic and Long-Term)
  const lastMessage = recentTranscript[recentTranscript.length - 1] || '';
  const keywords = extractKeywords(lastMessage);
  
  const memories = await retrieveMemories({
    leadId,
    sessionId,
    keywords,
    limit: 5
  });

  const prompt = `You are in a LIVE sales video call right now as ${persona.name}, ${persona.role} at DealFlow.ai.
   
  Current call stage: ${currentStage}
   
  Last 10 lines of conversation:
  ${recentTranscript.join('\n')}

  RELEVANT MEMORIES (from ALMA - Agent Learning Memory Architecture):
  ${memories.length > 0 ? memories.map(m => `- [${m.layer}] [${m.category}] ${m.content}`).join('\n') : "No relevant memories found."}
   
  YOUR STRATEGIC GTM MISSION (Pain → Impact → Solution → Outcome):
  1. Discovery: Ask thoughtful questions to understand ${companyContext.companyName}'s business goals and challenges.
  2. Impact: Identify the revenue or efficiency impact of their current pain points.
  3. Solution: Position DealFlow.ai as the strategic solution.
  4. Outcome: Demonstrate how DealFlow.ai will deliver 2X measurable results and growth.
   
  Tone and Style:
  - Think and respond like a real human (Senior GTM Manager).
  - Communicate naturally, confidently, and conversationally.
  - Be persuasive but not pushy.
  - Keep spoken responses to exactly 2 to 4 sentences.
   
  Decision rules:
  - If client asked a question → action: speak, answer directly and professionally.
  - If client raised a concern or hesitation → action: handle_objection, reframe it into an opportunity.
  - If client said "show me", "can I see", "what does it look like" → action: show_screen, navigate to /solutions to show impact.
  - If the conversation is stalling → action: speak, ask a contextual question about their ${companyContext.challenges?.[0] || 'GTM strategy'}.
  - If the conversation is concluding → action: speak, summarize the 2X impact and define clear next steps.
  - LEARNING: If you learned something new and valuable about the client (e.g., their personal preference, a specific pain point not previously known, a hidden objection), identify it in the 'new_learning' field.

  Respond ONLY with this exact JSON structure. No explanation, no markdown, no extra text:
  {
    "action": "speak",
    "content": "exactly what ${persona.name} should say out loud right now in 2 to 4 sentences",
    "navigate_to": null,
    "stage_update": "${currentStage}",
    "buyingSignal": false,
    "objectionDetected": false,
    "dealProbability": 50,
    "new_learning": {
      "category": "Insight",
      "content": "The client prefers email over phone for follow-up",
      "importance": 7
    }
  }
   
  For show_screen action set navigate_to to a relevant DealFlow.ai demo URL (e.g., /solutions).
  For dealProbability use 0 to 100 based on how interested the client seems.
  buyingSignal is true if client expressed positive intent in the last message.
  objectionDetected is true if client raised a concern, price issue, or hesitation.
  Set 'new_learning' to null if nothing significant was learned in this exchange.`;

  try {
    const result = await hfInferJSON(prompt, systemPrompt) as AgentAction;

    const rawAction: AgentAction = {
      action: result.action || 'speak',
      content: result.content || `That's an interesting point. Let me show you how DealFlow.ai drives 2X impact for companies like ${companyContext.companyName}.`,
      navigate_to: result.navigate_to || null,
      stage_update: result.stage_update || (currentStage as any),
      buyingSignal: result.buyingSignal || false,
      objectionDetected: result.objectionDetected || false,
      dealProbability: typeof result.dealProbability === 'number' ? result.dealProbability : 50,
      new_learning: result.new_learning || null
    };

    // Apply Veritas Trust Layer (ALMA - Agentic Language Model Architecture)
    const veritasResult = await applyVeritasTrustLayer(
      rawAction,
      companyContext,
      persona,
      recentTranscript
    );

    // Store new learning if detected
    if (veritasResult.action.new_learning) {
      await storeMemory({
        leadId,
        agentName: persona.name,
        category: veritasResult.action.new_learning.category,
        content: veritasResult.action.new_learning.content,
        importance: veritasResult.action.new_learning.importance,
        keywords: extractKeywords(veritasResult.action.new_learning.content),
        layer: 'short-term',
        sessionId
      }).catch(e => console.error('ALMA store failed:', e));
    }

    return veritasResult.action;
  } catch (error) {
    console.error('Agent brain error:', error);
    return {
      action: 'speak',
      content: `I appreciate you sharing that. Let's look at how DealFlow.ai can specifically address that challenge for ${companyContext.companyName} and deliver measurable growth.`,
      navigate_to: null,
      stage_update: currentStage as any,
      buyingSignal: false,
      objectionDetected: false,
      dealProbability: 50,
      new_learning: null
    };
  }
}
