// lib/security.ts
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import _sodium from 'libsodium-wrappers';

// Multi-tiered Encryption Module
// Tier 1: AES-256-GCM (Data-in-Transit / Internal)
// Tier 2: XChaCha20-Poly1305 (Data-at-Rest / Application Level)

const AES_KEY_SIZE = 32; // 256 bits
const AES_IV_SIZE = 12; // 96 bits for GCM
const AES_AUTH_TAG_SIZE = 16;

/**
 * AES-256-GCM Encryption (High Performance)
 */
export function encryptAES(data: string, key: Buffer): string {
  const iv = randomBytes(AES_IV_SIZE);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptAES(encryptedData: string, key: Buffer): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * XChaCha20-Poly1305 Encryption (Advanced Data-at-Rest)
 * Uses libsodium for cryptographic primitives.
 */
export async function encryptXChaCha20(data: string, key: Uint8Array): Promise<string> {
  await _sodium.ready;
  const sodium = _sodium;
  
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    data,
    null,
    null,
    nonce,
    key
  );
  
  return sodium.to_hex(nonce) + sodium.to_hex(ciphertext);
}

export async function decryptXChaCha20(encryptedHex: string, key: Uint8Array): Promise<string> {
  await _sodium.ready;
  const sodium = _sodium;
  
  const nonceSize = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
  const nonce = sodium.from_hex(encryptedHex.slice(0, nonceSize * 2));
  const ciphertext = sodium.from_hex(encryptedHex.slice(nonceSize * 2));
  
  const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key
  );
  
  return sodium.to_string(decrypted);
}

/**
 * Zero-Trust Audit Logging Foundation
 * Prepares data for blockchain-based integrity verification.
 */
export function generateAuditHash(payload: any): string {
  const data = JSON.stringify(payload);
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Rate Limiting and Anomaly Detection Helper
 */
export interface SecurityAnomaly {
  type: 'RATE_LIMIT' | 'SCHEMA_VIOLATION' | 'UNAUTHORIZED_ACCESS' | 'INJECTION_ATTACK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  details: string;
  timestamp: string;
}

export function detectAnomaly(request: any): SecurityAnomaly | null {
  // Behavioral analytics logic would go here
  // For now, basic pattern matching against MITRE ATT&CK patterns
  const body = JSON.stringify(request.body || {});
  
  if (body.includes('<script>') || body.includes('OR 1=1')) {
    return {
      type: 'INJECTION_ATTACK',
      severity: 'CRITICAL',
      details: 'Potential XSS or SQLi detected in request body',
      timestamp: new Date().toISOString()
    };
  }
  
  return null;
}
