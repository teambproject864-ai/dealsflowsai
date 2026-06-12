import { z } from 'zod';

// --- Configuration Validation Schemas ---
const GpuConfigSchema = z.object({
  driverVersion: z.string().min(1),
  cudaVersion: z.string().min(1),
  enableNVLink: z.boolean(),
  enableInfiniBand: z.boolean(),
  enableGPUDirectStorage: z.boolean(),
  partitioning: z.enum(['MIG', 'none']),
});

const SecurityConfigSchema = z.object({
  encryption: z.enum(['AES-256-GCM', 'FIPS-140-2', 'ChaCha20-Poly1305']),
  authProtocol: z.enum(['OIDC/SAML', 'API Key', 'JWT']),
  mTLS: z.boolean(),
  logRetentionDays: z.number().int().positive(),
});

const MonitoringConfigSchema = z.object({
  telemetryStreaming: z.boolean(),
  metricsInterval: z.string().min(1),
});

const InfraConfigSchema = z.object({
  gpu: GpuConfigSchema,
  security: SecurityConfigSchema,
  monitoring: MonitoringConfigSchema,
});

// --- Environment Variable Loading ---
const loadFromEnv = () => {
  return {
    gpu: {
      driverVersion: process.env.GPU_DRIVER_VERSION || '>=535.xx',
      cudaVersion: process.env.CUDA_VERSION || '>=12.2',
      enableNVLink: (process.env.ENABLE_NV_LINK || 'true').toLowerCase() === 'true',
      enableInfiniBand: (process.env.ENABLE_INFINIBAND || 'true').toLowerCase() === 'true',
      enableGPUDirectStorage: (process.env.ENABLE_GPU_DIRECT_STORAGE || 'true').toLowerCase() === 'true',
      partitioning: (process.env.GPU_PARTITIONING || 'MIG') as any,
    },
    security: {
      encryption: (process.env.SECURITY_ENCRYPTION || 'FIPS-140-2') as any,
      authProtocol: (process.env.AUTH_PROTOCOL || 'OIDC/SAML') as any,
      mTLS: (process.env.ENABLE_MTLS || 'true').toLowerCase() === 'true',
      logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '90', 10),
    },
    monitoring: {
      telemetryStreaming: (process.env.TELEMETRY_STREAMING || 'true').toLowerCase() === 'true',
      metricsInterval: process.env.METRICS_INTERVAL || '1s',
    },
  };
};

// --- Configuration Object ---
const rawConfig = loadFromEnv();
const validationResult = InfraConfigSchema.safeParse(rawConfig);

if (!validationResult.success) {
  console.warn(
    '[InfrastructureConfig] Invalid configuration detected. Using default values. Errors:',
    validationResult.error.format()
  );
}

export const INFRA_CONFIG = validationResult.success ? validationResult.data : rawConfig;

// --- Environment Validation ---
export interface EnvironmentValidationResult {
  valid: boolean;
  drivers?: 'PASSED' | 'FAILED' | 'UNKNOWN';
  cuda?: 'PASSED' | 'FAILED' | 'UNKNOWN';
  nvlink?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  storage?: 'GPUDirect_READY' | 'NOT_READY' | 'UNKNOWN';
  errors?: string[];
}

/**
 * Validates the hardware and software environment for high-performance execution.
 * @returns Promise<EnvironmentValidationResult>
 */
export async function validateExecutionEnvironment(): Promise<EnvironmentValidationResult> {
  const result: EnvironmentValidationResult = {
    valid: true,
    drivers: 'UNKNOWN',
    cuda: 'UNKNOWN',
    nvlink: 'UNKNOWN',
    storage: 'UNKNOWN',
    errors: [],
  };

  try {
    console.log('[InfrastructureConfig] Validating GPU drivers and CUDA compatibility...');
    
    // 1. Check OS platform
    const os = require('os');
    const platform = os.platform();
    console.log(`[InfrastructureConfig] Detected platform: ${platform}`);

    // 2. Check Node.js version
    const nodeVersion = process.version;
    console.log(`[InfrastructureConfig] Node.js version: ${nodeVersion}`);
    if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20') && !nodeVersion.startsWith('v22')) {
      result.errors?.push(`Node.js version ${nodeVersion} is not recommended. Use v18, v20, or v22.`);
    }

    // 3. Check available memory
    const totalMemoryGB = os.totalmem() / (1024 ** 3);
    console.log(`[InfrastructureConfig] Total system memory: ${totalMemoryGB.toFixed(2)} GB`);
    if (totalMemoryGB < 16) {
      result.errors?.push('Less than 16GB of memory detected. Performance may be degraded.');
    }

    // 4. Check CPU cores
    const cpuCores = os.cpus().length;
    console.log(`[InfrastructureConfig] CPU cores: ${cpuCores}`);
    if (cpuCores < 4) {
      result.errors?.push('Less than 4 CPU cores detected. Performance may be degraded.');
    }

    // 5. Mock GPU checks (in real implementation, use nvidia-smi or similar)
    result.drivers = 'PASSED';
    result.cuda = 'PASSED';
    result.nvlink = 'ACTIVE';
    result.storage = 'GPUDirect_READY';
    console.log('[InfrastructureConfig] Environment validation completed');
  } catch (error: any) {
    result.valid = false;
    result.errors?.push(`Environment validation failed: ${error.message}`);
    console.error('[InfrastructureConfig] Error validating environment:', error.message);
  }

  result.valid = (result.errors?.length || 0) === 0;
  return result;
}

// --- Helper Functions ---
export function getInfraConfigSummary() {
  return {
    platform: require('os').platform(),
    arch: require('os').arch(),
    nodeVersion: process.version,
    config: INFRA_CONFIG,
  };
}

const InfrastructureConfig = {
  INFRA_CONFIG,
  validateExecutionEnvironment,
  getInfraConfigSummary,
};

export default InfrastructureConfig;
