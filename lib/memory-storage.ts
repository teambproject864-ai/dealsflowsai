let inMemoryLeads: Map<string, any> = new Map();
let inMemoryAnalyses: Map<string, any> = new Map();

export function getInMemoryLeads() {
  return inMemoryLeads;
}

export function getInMemoryAnalyses() {
  return inMemoryAnalyses;
}
