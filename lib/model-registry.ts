// lib/model-registry.ts
/**
 * Registry for Featured AI Models
 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: string;
  memoryRequirements: string;
  gpuModel: string;
  performanceProfile: {
    tokensPerSecond: number;
    latencyMs: number;
    contextWindow: number;
  };
}

export const MODEL_REGISTRY = {
  featured: [
    { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '80GB VRAM', gpuModel: 'NVIDIA H100', performanceProfile: { tokensPerSecond: 45, latencyMs: 120, contextWindow: 4096 } },
    { id: 'nemotron-3-8b', name: 'Nemotron 3 8B', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '24GB VRAM', gpuModel: 'NVIDIA A10G', performanceProfile: { tokensPerSecond: 120, latencyMs: 50, contextWindow: 8192 } },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'Nvidia NGC', type: 'Image', memoryRequirements: '24GB VRAM', gpuModel: 'NVIDIA A100', performanceProfile: { tokensPerSecond: 0, latencyMs: 2000, contextWindow: 0 } }
  ],
  nvidia: [
    { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '80GB VRAM', gpuModel: 'NVIDIA H100', performanceProfile: { tokensPerSecond: 38, latencyMs: 130, contextWindow: 32768 } },
    { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '80GB VRAM', gpuModel: 'NVIDIA H100', performanceProfile: { tokensPerSecond: 42, latencyMs: 115, contextWindow: 65536 } },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '80GB VRAM', gpuModel: 'NVIDIA H100', performanceProfile: { tokensPerSecond: 40, latencyMs: 125, contextWindow: 131072 } },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '24GB VRAM', gpuModel: 'NVIDIA A10G', performanceProfile: { tokensPerSecond: 130, latencyMs: 45, contextWindow: 131072 } },
    { id: 'mistralai/mistral-large-3', name: 'Mistral Large 3', provider: 'Nvidia NGC', type: 'LLM', memoryRequirements: '80GB VRAM', gpuModel: 'NVIDIA H100', performanceProfile: { tokensPerSecond: 50, latencyMs: 100, contextWindow: 32768 } },
  ],
  benchmarks: {
    targetUtilization: 0.9, // 90% GPU
    p99LatencyMs: 100
  }
};

export interface ModelInvocationLog {
  user: string;
  modelId: string;
  tokensIn: number;
  tokensOut: number;
  latency: number;
  gpuId: string;
  timestamp: string;
}

/**
 * Captures detailed telemetry for model usage.
 */
export async function logModelInvocation(log: ModelInvocationLog) {
  console.log(`[ModelRegistry] Invocated ${log.modelId} (Lat: ${log.latency}ms, GPU: ${log.gpuId})`);
  // Log persistence to SIEM/WORM storage
}
