"use client";

import type { AnalysisResult, IntakeFormData, StoredLeadContext } from "./types";

export type { StoredLeadContext } from "./types";
import { STORAGE_KEY } from "./types";

export function saveLeadContext(form: IntakeFormData, analysis: AnalysisResult | null) {
  const payload: StoredLeadContext = {
    form,
    analysis,
    updatedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function loadLeadContext(): StoredLeadContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLeadContext;
  } catch {
    return null;
  }
}

export function clearLeadContext() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
