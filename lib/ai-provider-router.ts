import { hfInfer, hfInferJSON } from './huggingface';
import { nvInfer, nvInferJSON } from './nvidia';
import { kimiInfer, kimiInferJSON } from './kimi';

// Define supported AI providers
export const SUPPORTED_PROVIDERS = ['huggingface', 'nvidia', 'kimi'] as const;
export type SupportedAIProvider = typeof SUPPORTED_PROVIDERS[number];

// Request attributes that can determine provider selection
export interface ProviderRequestAttributes {
  userRegion?: string;
  requestType?: string;
  tierLevel?: 'starter' | 'growth' | 'enterprise';
}

// Provider mapping configuration
export interface ProviderMappingRule {
  condition: (attrs: ProviderRequestAttributes) => boolean;
  provider: SupportedAIProvider;
  priority: number;
}

// Log entry for provider switching
export interface ProviderSwitchLog {
  timestamp: number;
  requestId?: string;
  attributes: ProviderRequestAttributes;
  selectedProvider: SupportedAIProvider;
  fallbackFrom?: SupportedAIProvider;
  isFallback: boolean;
}

// In-memory log storage
const providerSwitchLogs: ProviderSwitchLog[] = [];

// Default provider (fallback)
const DEFAULT_PROVIDER: SupportedAIProvider = 'huggingface';

// Provider mapping rules
const PROVIDER_MAPPING_RULES: ProviderMappingRule[] = [
  // Enterprise tier: use nvidia for highest performance
  {
    condition: (attrs) => attrs.tierLevel === 'enterprise',
    provider: 'nvidia',
    priority: 10,
  },
  // Growth tier: use kimi for balanced performance and cost
  {
    condition: (attrs) => attrs.tierLevel === 'growth',
    provider: 'kimi',
    priority: 9,
  },
  // Starter tier: use huggingface
  {
    condition: (attrs) => attrs.tierLevel === 'starter',
    provider: 'huggingface',
    priority: 8,
  },
  // Region-based rules (example)
  {
    condition: (attrs) => !!attrs.userRegion?.startsWith('Asia'),
    provider: 'kimi',
    priority: 7,
  },
  {
    condition: (attrs) => !!attrs.userRegion?.startsWith('North America'),
    provider: 'nvidia',
    priority: 7,
  },
  // Request type-based rules (example)
  {
    condition: (attrs) => attrs.requestType === 'analysis',
    provider: 'kimi',
    priority: 6,
  },
];

/**
 * Validate if a provider is supported
 */
export function isSupportedProvider(provider: string): provider is SupportedAIProvider {
  return SUPPORTED_PROVIDERS.includes(provider as SupportedAIProvider);
}

/**
 * Log a provider selection event
 */
function logProviderSelection(
  attributes: ProviderRequestAttributes,
  selectedProvider: SupportedAIProvider,
  fallbackFrom?: SupportedAIProvider
): void {
  const logEntry: ProviderSwitchLog = {
    timestamp: Date.now(),
    attributes,
    selectedProvider,
    fallbackFrom,
    isFallback: !!fallbackFrom,
  };
  providerSwitchLogs.push(logEntry);
  
  // Also log to console for debugging
  console.log(
    `[AI Provider Router] Selected provider: ${selectedProvider}`,
    fallbackFrom ? `(fallback from ${fallbackFrom})` : '',
    'Attributes:', attributes
  );
}

/**
 * Select provider based on request attributes
 */
export function selectAIProvider(
  attributes: ProviderRequestAttributes = {},
  requestId?: string
): SupportedAIProvider {
  // First check if AI_PROVIDER is set in environment variables
  const envProvider = process.env.AI_PROVIDER;
  if (envProvider && isSupportedProvider(envProvider)) {
    logProviderSelection(attributes, envProvider);
    return envProvider;
  }

  // Find matching rules sorted by priority (highest first)
  const matchingRules = PROVIDER_MAPPING_RULES.filter((rule) =>
    rule.condition(attributes)
  ).sort((a, b) => b.priority - a.priority);

  if (matchingRules.length > 0) {
    const selectedProvider = matchingRules[0].provider;
    logProviderSelection(attributes, selectedProvider);
    return selectedProvider;
  }

  // No rules matched, use default
  logProviderSelection(attributes, DEFAULT_PROVIDER);
  return DEFAULT_PROVIDER;
}

/**
 * Get provider-specific inference functions
 */
export function getProviderInferenceFunctions(provider: SupportedAIProvider) {
  switch (provider) {
    case 'huggingface':
      return { infer: hfInfer, inferJSON: hfInferJSON };
    case 'nvidia':
      return { infer: nvInfer, inferJSON: nvInferJSON };
    case 'kimi':
      return { infer: kimiInfer, inferJSON: kimiInferJSON };
    default:
      // This should never happen with TypeScript checks
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Perform dynamic inference with provider selection
 */
export async function performDynamicInference(
  prompt: string,
  systemPrompt: string,
  attributes: ProviderRequestAttributes = {},
  options: any = {}
): Promise<string> {
  const provider = selectAIProvider(attributes);
  const { infer } = getProviderInferenceFunctions(provider);
  
  try {
    return await infer(prompt, systemPrompt, options);
  } catch (error) {
    console.error(
      `[AI Provider Router] Inference with ${provider} failed, falling back to ${DEFAULT_PROVIDER}`,
      error
    );
    logProviderSelection(attributes, DEFAULT_PROVIDER, provider);
    const { infer: fallbackInfer } = getProviderInferenceFunctions(DEFAULT_PROVIDER);
    return await fallbackInfer(prompt, systemPrompt, options);
  }
}

/**
 * Perform dynamic JSON inference with provider selection
 */
export async function performDynamicInferenceJSON(
  prompt: string,
  systemPrompt: string,
  attributes: ProviderRequestAttributes = {},
  options: any = {}
): Promise<any> {
  const provider = selectAIProvider(attributes);
  const { inferJSON } = getProviderInferenceFunctions(provider);
  
  try {
    return await inferJSON(prompt, systemPrompt, options);
  } catch (error) {
    console.error(
      `[AI Provider Router] JSON inference with ${provider} failed, falling back to ${DEFAULT_PROVIDER}`,
      error
    );
    logProviderSelection(attributes, DEFAULT_PROVIDER, provider);
    const { inferJSON: fallbackInferJSON } = getProviderInferenceFunctions(DEFAULT_PROVIDER);
    return await fallbackInferJSON(prompt, systemPrompt, options);
  }
}

/**
 * Get all provider switch logs
 */
export function getProviderSwitchLogs(limit: number = 100): ProviderSwitchLog[] {
  return providerSwitchLogs.slice(-limit);
}

/**
 * Clear provider switch logs
 */
export function clearProviderSwitchLogs(): void {
  providerSwitchLogs.length = 0;
}
