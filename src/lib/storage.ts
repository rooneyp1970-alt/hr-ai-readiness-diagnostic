import { AssessmentState, QuestionState } from './types';
import { createInitialState } from './scoring';

const STORAGE_KEY = 'hr-ai-readiness-state';
const CURRENT_VERSION = 3;

// ─── Classification value mapping (v2 → v3) ────────────────────────────────

const V2_TO_V3_CLASSIFICATION: Record<string, string> = {
  'hygienic': 'critical-gap',
  'both': 'needs-work',
  'optimization': 'room-to-improve',
  'not-an-issue': 'in-good-shape',
};

// ─── V1 → V3 Migration ──────────────────────────────────────────────────────

interface V1QuestionState {
  questionId: string;
  rating: number | null;
  notes: string;
}

function migrateV1(raw: Record<string, unknown>): AssessmentState {
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

// ─── V2 → V3 Migration (classification value rename) ────────────────────────

function migrateV2toV3(raw: Record<string, unknown>): AssessmentState {
  const v2States = (raw.questionStates as Array<Record<string, unknown>>) ?? [];
  const questionStates: QuestionState[] = v2States.map((qs) => {
    const oldClassification = qs.classification as string | null;
    const newClassification = oldClassification && V2_TO_V3_CLASSIFICATION[oldClassification]
      ? V2_TO_V3_CLASSIFICATION[oldClassification] as QuestionState['classification']
      : oldClassification as QuestionState['classification'];
    return {
      questionId: qs.questionId as string,
      classification: newClassification,
      importance: qs.importance as number | null,
      notes: (qs.notes as string) ?? '',
      rating: qs.rating as number | null,
    };
  });

  return {
    version: CURRENT_VERSION,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    lastSavedAt: (raw.lastSavedAt as string) ?? new Date().toISOString(),
    challengesText: (raw.challengesText as string) ?? '',
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

    // Migrate old versions
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      let migrated: AssessmentState;
      if (!parsed.version || parsed.version < 2) {
        migrated = migrateV1(parsed);
      } else {
        migrated = migrateV2toV3(parsed);
      }
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
  if (!parsed.version || parsed.version < 2) {
    return migrateV1(parsed);
  }
  if (parsed.version < CURRENT_VERSION) {
    return migrateV2toV3(parsed);
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
