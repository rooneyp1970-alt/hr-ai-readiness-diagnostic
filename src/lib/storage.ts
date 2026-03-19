import { AssessmentState } from './types';
import { createInitialState } from './scoring';

const STORAGE_KEY = 'hr-ai-readiness-state';

export function loadState(): AssessmentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentState;
  } catch {
    return null;
  }
}

export function saveState(state: AssessmentState): void {
  if (typeof window === 'undefined') return;
  const updated = { ...state, lastSavedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportStateJSON(state: AssessmentState): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJSON(json: string): AssessmentState {
  const parsed = JSON.parse(json);
  if (!parsed.version || !parsed.questionStates) {
    throw new Error('Invalid assessment file format');
  }
  return parsed as AssessmentState;
}

export function getOrCreateState(): AssessmentState {
  const existing = loadState();
  if (existing) return existing;
  const fresh = createInitialState();
  saveState(fresh);
  return fresh;
}
