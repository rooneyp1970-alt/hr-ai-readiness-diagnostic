import { AssessmentState, QuestionState } from './types';
import { createInitialState } from './scoring';

const STORAGE_KEY = 'hr-ai-readiness-state';
const CURRENT_VERSION = 2;

// ─── V1 → V2 Migration ──────────────────────────────────────────────────────

interface V1QuestionState {
  questionId: string;
  rating: number | null;
  notes: string;
}

function migrateV1toV2(raw: Record<string, unknown>): AssessmentState {
  const v1States = (raw.questionStates as V1QuestionState[]) ?? [];
  const questionStates: QuestionState[] = v1States.map((qs) => ({
    questionId: qs.questionId,
    classification: null,
    importance: qs.rating,
    notes: qs.notes ?? '',
    rating: qs.rating,
  }));

  return {
    version: CURRENT_VERSION,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    lastSavedAt: (raw.lastSavedAt as string) ?? new Date().toISOString(),
    challengesText: '',
    questionStates,
    weightsConfig: (raw.weightsConfig as AssessmentState['weightsConfig']) ?? {
      mode: 'equal',
      categoryWeights: [],
    },
    finalSnapshot: null,
    dirtyAfterFinal: false,
  };
}

// ─── Load / Save ─────────────────────────────────────────────────────────────

export function loadState(): AssessmentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Migrate v1 → v2
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      const migrated = migrateV1toV2(parsed);
      saveState(migrated);
      return migrated;
    }

    return parsed as AssessmentState;
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
  if (!parsed.questionStates) {
    throw new Error('Invalid assessment file format');
  }
  // Migrate if needed
  if (!parsed.version || parsed.version < CURRENT_VERSION) {
    return migrateV1toV2(parsed);
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
