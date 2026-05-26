const LEADS_STORAGE_KEY = "dealflow_in_memory_leads_v1";
const ANALYSES_STORAGE_KEY = "dealflow_in_memory_analyses_v1";

let inMemoryLeads: Map<string, any> = new Map();
let inMemoryAnalyses: Map<string, any> = new Map();

function loadFromStorage(key: string): Map<string, any> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const data = JSON.parse(raw);
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function saveToStorage(key: string, map: Map<string, any>) {
  if (typeof window === "undefined") return;
  try {
    const data = Object.fromEntries(map);
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

inMemoryLeads = loadFromStorage(LEADS_STORAGE_KEY);
inMemoryAnalyses = loadFromStorage(ANALYSES_STORAGE_KEY);

export function getInMemoryLeads() {
  return inMemoryLeads;
}

export function getInMemoryAnalyses() {
  return inMemoryAnalyses;
}

export function setLead(id: string, data: any) {
  const existing = inMemoryLeads.get(id);
  const now = new Date().toISOString();
  inMemoryLeads.set(id, {
    ...existing,
    ...data,
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  saveToStorage(LEADS_STORAGE_KEY, inMemoryLeads);
}

export function setAnalysis(id: string, data: any) {
  const existing = inMemoryAnalyses.get(id);
  const now = new Date().toISOString();
  inMemoryAnalyses.set(id, {
    ...existing,
    ...data,
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  saveToStorage(ANALYSES_STORAGE_KEY, inMemoryAnalyses);
}

export function getLead(id: string) {
  return inMemoryLeads.get(id);
}

export function getAnalysis(id: string) {
  return inMemoryAnalyses.get(id);
}
