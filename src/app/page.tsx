'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import WelcomeScreen from '../components/WelcomeScreen';
import ChallengesScreen from '../components/ChallengesScreen';
import SplashScreen from '../components/SplashScreen';
import WizardScreen from '../components/WizardScreen';
import ReviewScreen from '../components/ReviewScreen';
import ResultsScreen from '../components/ResultsScreen';
import ExportScreen from '../components/ExportScreen';
import SettingsScreen from '../components/SettingsScreen';

function DiagnosticApp() {
  const store = useAssessmentStore();
  const searchParams = useSearchParams();

  // Handle ?settings=1 URL parameter
  useEffect(() => {
    if (searchParams.get('settings') === '1' && store.loaded && store.state) {
      store.setScreen('settings');
    }
  }, [searchParams, store.loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!store.loaded) {
    return (
      <div className="min-h-screen bg-shore-mist flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-shore-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-shore-slate">Loading diagnostic...</p>
        </div>
      </div>
    );
  }

  // Last saved indicator
  const lastSavedIndicator = store.lastSaved && store.screen !== 'welcome' && store.screen !== 'challenges' && store.screen !== 'splash' && (
    <div className="fixed bottom-4 right-4 z-20 print:hidden">
      <div className="rounded-lg bg-white border border-gray-200 shadow-sm px-3 py-1.5 text-xs text-gray-400">
        Last saved: {new Date(store.lastSaved).toLocaleTimeString()}
      </div>
    </div>
  );

  switch (store.screen) {
    case 'welcome':
      return (
        <WelcomeScreen
          hasExisting={store.hasExisting}
          lastSaved={store.lastSaved}
          state={store.state}
          onStartNew={store.startNew}
          onResume={store.resumeAssessment}
          onImport={store.importAssessment}
          onReset={store.resetAssessment}
        />
      );

    case 'challenges':
      return (
        <ChallengesScreen
          challengesText={store.state?.challengesText ?? ''}
          onSetChallengesText={store.setChallengesText}
          onNavigate={store.setScreen}
        />
      );

    case 'splash':
      return (
        <SplashScreen onNavigate={store.setScreen} />
      );

    case 'wizard':
      if (!store.state || !store.draftScore) return null;
      return (
        <>
          <WizardScreen
            state={store.state}
            currentIndex={store.currentQuestionIndex}
            onSetIndex={store.setCurrentQuestionIndex}
            onSetClassification={store.setClassification}
            onSetImportance={store.setImportance}
            onSetNotes={store.setNotes}
            onNavigate={store.setScreen}
            draftOverall={store.draftScore.overall}
            answeredCount={store.draftScore.answeredCount}
          />
          {lastSavedIndicator}
        </>
      );

    case 'review':
      if (!store.state || !store.draftScore) return null;
      return (
        <>
          <ReviewScreen
            state={store.state}
            draftOverall={store.draftScore.overall}
            answeredCount={store.draftScore.answeredCount}
            onJumpToQuestion={(index) => {
              store.setCurrentQuestionIndex(index);
              store.setScreen('wizard');
            }}
            onNavigate={store.setScreen}
          />
          {lastSavedIndicator}
        </>
      );

    case 'results':
      if (!store.state || !store.draftScore) return null;
      return (
        <>
          <ResultsScreen
            state={store.state}
            draftScore={store.draftScore}
            onCalculateFinal={store.calculateFinalScore}
            onNavigate={store.setScreen}
            onJumpToQuestion={(index) => {
              store.setCurrentQuestionIndex(index);
            }}
          />
          {lastSavedIndicator}
        </>
      );

    case 'export':
      if (!store.state || !store.draftScore) return null;
      return (
        <>
          <ExportScreen
            state={store.state}
            draftScore={store.draftScore}
            onNavigate={store.setScreen}
            onReset={store.resetAssessment}
          />
          {lastSavedIndicator}
        </>
      );

    case 'settings':
      if (!store.state) return null;
      return (
        <SettingsScreen
          state={store.state}
          onUpdateWeights={store.updateWeights}
          onNavigate={store.setScreen}
        />
      );

    default:
      return null;
  }
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-shore-mist flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-shore-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DiagnosticApp />
    </Suspense>
  );
}
