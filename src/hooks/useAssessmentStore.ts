'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssessmentState, Screen, WeightsConfig } from '../lib/types';
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
    setScreen('wizard');
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

  const setRating = useCallback(
    (questionId: string, rating: number | null) => {
      updateState((prev) => {
        const questionStates = prev.questionStates.map((qs) => {
          if (qs.questionId !== questionId) return qs;
          return { ...qs, rating };
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
    setRating,
    setNotes,
    calculateFinalScore,
    updateWeights,
  };
}
