// Core logic for autonomous agent reasoning
import { performInferenceJSON } from './inference';
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

  // Retrieve relevant contextual information for the interaction
  const lastMessage = recentTranscript[recentTranscript.length - 1] || '';
  const keywords = extractKeywords(lastMessage);
  
  const memories = await retrieveMemories({
    leadId,
    sessionId,
    keywords,
    limit: 5
  });

  const prompt = `You are in a live interaction right now as ${persona.name}, ${persona.role}.
   
  Current stage: ${currentStage}
   
  Recent conversation history:
  ${recentTranscript.join('\n')}

  RELEVANT CONTEXT:
  ${memories.length > 0 ? memories.map(m => `- [${m.layer}] [${m.category}] ${m.content}`).join('\n') : "No relevant context found."}
   
  STRATEGIC MISSION:
  1. Discovery: Ask thoughtful questions to understand the goals and challenges.
  2. Impact: Identify the value or efficiency impact of current pain points.
  3. Solution: Position the platform as the strategic solution.
  4. Outcome: Demonstrate how the platform delivers measurable results and growth.
   
  Tone and Style:
  - Think and respond like a professional manager.
  - Communicate naturally, confidently, and conversationally.
  - Be persuasive but not pushy.
  - Keep spoken responses concise and focused.
   
  Decision rules:
  - If a question was asked → action: speak, answer directly and professionally.
  - If a concern or hesitation was raised → action: handle_objection, reframe it into an opportunity.
  - If a demonstration was requested → action: show_screen, navigate to the relevant presentation.
  - If the interaction is stalling → action: speak, ask a contextual question.
  - If the interaction is concluding → action: speak, summarize the impact and define clear next steps.
  - LEARNING: If valuable new information was identified, include it in the 'new_learning' field.

  Respond ONLY with the required structured format.
  {
    "action": "speak",
    "content": "the specific response to be communicated",
    "navigate_to": null,
    "stage_update": "${currentStage}",
    "buyingSignal": false,
    "objectionDetected": false,
    "dealProbability": 50,
    "new_learning": {
      "category": "Insight",
      "content": "The identified information",
      "importance": 7
    }
  }
   
  For dealProbability use the standard probability metric.
  buyingSignal is true if positive intent was expressed.
  objectionDetected is true if a concern or hesitation was raised.
  Set 'new_learning' to null if no significant information was identified.`;

  try {
    const result = await performInferenceJSON(prompt, systemPrompt) as AgentAction;

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

    // Apply the validation and security layer
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
      }).catch(e => console.error('Memory storage failed:', e));
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
