'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssessmentState, Classification, Screen, WeightsConfig, SEVERITY_MAP } from '../lib/types';
import { loadState, saveState, clearState } from '../lib/storage';
import { createInitialState, computeDraftScore, computeFinalSnapshot } from '../lib/scoring';

export function useAssessmentStore() {
  const [state, setState] = useState<AssessmentState | null>(null);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const existing = loadState();
    if (existing) {
      setState(existing);
    }
    setLoaded(true);
  }, []);

  // Debounced save
  const persistState = useCallback((newState: AssessmentState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveState(newState);
    }, 300);
  }, []);

  const updateState = useCallback(
    (updater: (prev: AssessmentState) => AssessmentState) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        persistState(next);
        return next;
      });
    },
    [persistState]
  );

  // ─── Actions ──────────────────────────────────────────────────────

  const startNew = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    saveState(fresh);
    setCurrentQuestionIndex(0);
    setScreen('challenges');
  }, []);

  const resumeAssessment = useCallback(() => {
    setScreen('wizard');
  }, []);

  const importAssessment = useCallback((imported: AssessmentState) => {
    setState(imported);
    saveState(imported);
    setScreen('welcome');
  }, []);

  const resetAssessment = useCallback(() => {
    clearState();
    setState(null);
    setCurrentQuestionIndex(0);
    setScreen('welcome');
  }, []);

  const setChallengesText = useCallback(
    (text: string) => {
      updateState((prev) => ({
        ...prev,
        challengesText: text,
      }));
    },
    [updateState]
  );

  const setClassification = useCallback(
    (questionId: string, classification: Classification | null) => {
      updateState((prev) => {
        const questionStates = prev.questionStates.map((qs) => {
          if (qs.questionId !== questionId) return qs;
          const newImportance = classification === 'not-an-issue' ? 0 : qs.importance;
          const combined = classification
            ? SEVERITY_MAP[classification] * (newImportance ?? 0)
            : null;
          return {
            ...qs,
            classification,
            importance: newImportance,
            rating: combined !== null ? Math.round(combined * 10) / 10 : null,
          };
        });
        return {
          ...prev,
          questionStates,
          dirtyAfterFinal: prev.finalSnapshot !== null ? true : prev.dirtyAfterFinal,
        };
      });
    },
    [updateState]
  );

  const setImportance = useCallback(
    (questionId: string, importance: number | null) => {
      updateState((prev) => {
        const questionStates = prev.questionStates.map((qs) => {
          if (qs.questionId !== questionId) return qs;
          const combined = qs.classification
            ? SEVERITY_MAP[qs.classification] * (importance ?? 0)
            : null;
          return {
            ...qs,
            importance,
            rating: combined !== null ? Math.round(combined * 10) / 10 : null,
          };
        });
        return {
          ...prev,
          questionStates,
          dirtyAfterFinal: prev.finalSnapshot !== null ? true : prev.dirtyAfterFinal,
        };
      });
    },
    [updateState]
  );

  // Legacy compat: setRating sets importance directly (for any remaining callers)
  const setRating = useCallback(
    (questionId: string, rating: number | null) => {
      setImportance(questionId, rating);
    },
    [setImportance]
  );

  const setNotes = useCallback(
    (questionId: string, notes: string) => {
      updateState((prev) => {
        const questionStates = prev.questionStates.map((qs) => {
          if (qs.questionId !== questionId) return qs;
          return { ...qs, notes };
        });
        return {
          ...prev,
          questionStates,
          dirtyAfterFinal: prev.finalSnapshot !== null ? true : prev.dirtyAfterFinal,
        };
      });
    },
    [updateState]
  );

  const calculateFinalScore = useCallback(() => {
    updateState((prev) => {
      const snapshot = computeFinalSnapshot(prev);
      return {
        ...prev,
        finalSnapshot: snapshot,
        dirtyAfterFinal: false,
      };
    });
  }, [updateState]);

  const updateWeights = useCallback(
    (weights: WeightsConfig) => {
      updateState((prev) => ({
        ...prev,
        weightsConfig: weights,
        dirtyAfterFinal: prev.finalSnapshot !== null ? true : prev.dirtyAfterFinal,
      }));
    },
    [updateState]
  );

  // ─── Derived Data ─────────────────────────────────────────────────

  const draftScore = state ? computeDraftScore(state) : null;
  const hasExisting = state !== null;
  const lastSaved = state?.lastSavedAt ?? null;

  return {
    state,
    loaded,
    screen,
    setScreen,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    draftScore,
    hasExisting,
    lastSaved,
    startNew,
    resumeAssessment,
    importAssessment,
    resetAssessment,
    setChallengesText,
    setClassification,
    setImportance,
    setRating,
    setNotes,
    calculateFinalScore,
    updateWeights,
  };
}
