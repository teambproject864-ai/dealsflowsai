import {
  AgentAssignment,
  CustomerCredentials,
  PageLockState,
  HeyGenVideo,
} from "./types";
import { LRUCache } from "lru-cache";

let inMemoryLeads = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 15 // 15 minutes TTL
});
let inMemoryAnalyses: Map<string, any> = new Map();
let inMemoryAgentAssignments: Map<string, AgentAssignment> = new Map();
let inMemoryCustomerCredentials: Map<string, CustomerCredentials> = new Map();
let inMemoryPageLocks: Map<string, PageLockState[]> = new Map();
let inMemoryHeyGenVideos: Map<string, HeyGenVideo> = new Map();

export function getInMemoryLeads() {
  return inMemoryLeads;
}

export function getInMemoryAnalyses() {
  return inMemoryAnalyses;
}

export function getInMemoryAgentAssignments() {
  return inMemoryAgentAssignments;
}

export function getInMemoryCustomerCredentials() {
  return inMemoryCustomerCredentials;
}

export function getInMemoryPageLocks() {
  return inMemoryPageLocks;
}

export function getInMemoryHeyGenVideos() {
  return inMemoryHeyGenVideos;
}
