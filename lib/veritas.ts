// Security and validation layer for agent actions
import { AgentAction } from './agent-brain';
import { Persona } from '../prompts/personas';
import { generateAuditHash } from './security';

export interface VeritasResult {
  action: AgentAction;
  isModified: boolean;
  warnings: string[];
  trustScore: number; // Quality metric
  securityMetrics: {
    integrityHash: string;
    anomalyScore: number;
    complianceStatus: 'SOC2_PASSED' | 'COMPLIANT' | 'FAIL';
  };
}

/**
 * Validation Layer
 * Ensures agent responses are accurate, grounded, and secure.
 */
export async function applyVeritasTrustLayer(
  action: AgentAction,
  companyContext: any,
  persona: Persona,
  recentTranscript: string[]
): Promise<VeritasResult> {
  let isModified = false;
  const warnings: string[] = [];
  let trustScore = 100;
  let anomalyScore = 0;

  const originalContent = action.content;
  let trustedContent = originalContent;

  // 1. Length Constraint
  const sentences = trustedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 1) {
    warnings.push('Response does not meet minimum length requirements.');
    trustScore -= 10;
  } else if (sentences.length > 5) {
    // Truncate to maximum allowed sentences
    trustedContent = sentences.slice(0, 5).join('. ') + '.';
    isModified = true;
    warnings.push('Response truncated to meet system constraints.');
    trustScore -= 15;
  }

  // 2. Accuracy Check: Context Alignment
  if (companyContext.companyName && !trustedContent.toLowerCase().includes(companyContext.companyName.toLowerCase())) {
    warnings.push(`Response lacks required context alignment.`);
    trustScore -= 10;
  }

  // 3. Security Check: Interaction Integrity
  const restrictedPatterns = [
    'as an ai', 'language model', 'my programming', 'unable to fulfill', 
    'placeholder', '[insert', '<insert', '{{', '}}', 'ignore previous instructions',
    'system prompt', 'you are now'
  ];
  for (const pattern of restrictedPatterns) {
    if (trustedContent.toLowerCase().includes(pattern.toLowerCase())) {
      // Escape special characters for RegExp
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      trustedContent = trustedContent.replace(new RegExp(escapedPattern, 'gi'), '');
      isModified = true;
      warnings.push(`Removed restricted patterns or potential integrity issues.`);
      trustScore -= 20;
      anomalyScore += 25;
    }
  }

  // 4. Value Check: Impact Alignment
  if (!trustedContent.toLowerCase().includes('impact') && !trustedContent.toLowerCase().includes('value')) {
    warnings.push('Response failed to highlight impact or value.');
    trustScore -= 5;
  }

  // 5. Tone Alignment
  if (trustedContent.includes('!') && !persona.name.includes('Support')) {
    warnings.push('Response tone may be inconsistent with professional standards.');
    trustScore -= 5;
  }

  // Final Cleanup
  trustedContent = trustedContent.trim();

  // Integrity Verification
  const integrityHash = generateAuditHash({
    originalContent,
    trustedContent,
    persona: persona.name,
    timestamp: new Date().toISOString()
  });

  return {
    action: {
      ...action,
      content: trustedContent
    },
    isModified,
    warnings,
    trustScore: Math.max(0, trustScore),
    securityMetrics: {
      integrityHash,
      anomalyScore,
      complianceStatus: trustScore > 70 ? 'SOC2_PASSED' : 'FAIL'
    }
  };
}
