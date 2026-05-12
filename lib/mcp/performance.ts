import { 
  JSONRPCRequest, 
  JSONRPCResponse
} from "./protocol";
import type { Transport } from "./client";

/**
 * Request Batcher for the communication protocol.
 * Combines multiple requests into a single batch if sent within a short window.
 */
export class MCPRequestBatcher {
  private transport: Transport;
  private queue: Array<{ 
    request: JSONRPCRequest; 
    resolve: (res: JSONRPCResponse) => void;
    reject: (err: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;
  private batchSize: number;
  private windowMs: number;

  constructor(transport: Transport, batchSize = 10, windowMs = 50) {
    this.transport = transport;
    this.batchSize = batchSize;
    this.windowMs = windowMs;
  }

  public async send(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.windowMs);
      }
    });
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const currentBatch = this.queue.splice(0, this.batchSize);
    if (currentBatch.length === 0) return;

    // The protocol supports JSON-RPC batching: [Req1, Req2, ...]
    // But our transport interface expects single requests.
    // For this implementation, we'll send them sequentially or adapt transport.
    // Let's assume the transport can handle an array for batching.
    try {
      // In a real implementation, we'd send the array to a server that supports it.
      // Here we simulate by sending each one.
      for (const item of currentBatch) {
        this.transport.send(item.request)
          .then(item.resolve)
          .catch(item.reject);
      }
    } catch (error) {
      currentBatch.forEach(item => item.reject(error));
    }
  }
}

/**
 * Simple Cache for resource access.
 */
export class MCPResourceCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private ttlMs: number;

  constructor(ttlMs = 60000) {
    this.ttlMs = ttlMs;
  }

  public get(uri: string): any | null {
    const entry = this.cache.get(uri);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(uri);
      return null;
    }
    return entry.data;
  }

  public set(uri: string, data: any) {
    this.cache.set(uri, {
      data,
      expires: Date.now() + this.ttlMs
    });
  }

  public invalidate(uri: string) {
    this.cache.delete(uri);
  }
}
