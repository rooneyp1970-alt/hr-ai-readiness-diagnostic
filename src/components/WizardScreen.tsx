'use client';

import { useState } from 'react';
import { AssessmentState, Classification, Screen } from '../lib/types';
import { CANONICAL_QUESTIONS, CATEGORIES, CATEGORY_DESCRIPTIONS, CLASSIFICATION_LABELS, CLASSIFICATION_DESCRIPTIONS, IMPORTANCE_LABELS, RATING_LABELS, RATING_DESCRIPTIONS } from '../lib/questions';
import Stepper from './Stepper';
import ProgressBar from './ProgressBar';

interface WizardScreenProps {
  state: AssessmentState;
  currentIndex: number;
  onSetIndex: (i: number) => void;
  onSetClassification: (questionId: string, classification: Classification | null) => void;
  onSetImportance: (questionId: string, importance: number | null) => void;
  onSetNotes: (questionId: string, notes: string) => void;
  onNavigate: (screen: Screen) => void;
  draftOverall: number;
  answeredCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Talent Acquisition': 'bg-shore-teal/10 text-shore-teal',
  'Onboarding': 'bg-blue-50 text-blue-700',
  'Payroll': 'bg-purple-50 text-purple-700',
  'Benefits': 'bg-emerald-50 text-emerald-700',
  'Learning and Development': 'bg-amber-50 text-amber-700',
  'Performance Management': 'bg-rose-50 text-rose-700',
  'Employee Relations and Compliance': 'bg-orange-50 text-orange-700',
  'HR Operations and Workforce Analytics': 'bg-shore-navy/10 text-shore-navy',
};

const CLASSIFICATION_CARDS: { value: Classification; icon: string; color: string; selectedColor: string }[] = [
  { value: 'hygienic', icon: '🛡️', color: 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/30', selectedColor: 'border-red-400 bg-red-50 ring-2 ring-red-200' },
  { value: 'optimization', icon: '🚀', color: 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30', selectedColor: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' },
  { value: 'both', icon: '⚡', color: 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30', selectedColor: 'border-purple-400 bg-purple-50 ring-2 ring-purple-200' },
  { value: 'not-an-issue', icon: '✓', color: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50', selectedColor: 'border-gray-400 bg-gray-100 ring-2 ring-gray-200' },
];

export default function WizardScreen({
  state,
  currentIndex,
  onSetIndex,
  onSetClassification,
  onSetImportance,
  onSetNotes,
  onNavigate,
  draftOverall,
  answeredCount,
}: WizardScreenProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const question = CANONICAL_QUESTIONS[currentIndex];
  const questionState = state.questionStates.find((qs) => qs.questionId === question.id);
  const currentClassification = questionState?.classification ?? null;
  const currentImportance = questionState?.importance ?? null;
  const currentNotes = questionState?.notes ?? '';
  const isNotAnIssue = currentClassification === 'not-an-issue';

  const completionProgress = Math.round((answeredCount / CANONICAL_QUESTIONS.length) * 100);

  // Check if entering new category
  const prevQuestion = currentIndex > 0 ? CANONICAL_QUESTIONS[currentIndex - 1] : null;
  const isNewCategory = !prevQuestion || prevQuestion.category !== question.category;
  const categoryDesc = CATEGORY_DESCRIPTIONS[question.category];

  const goNext = () => {
    if (currentIndex < CANONICAL_QUESTIONS.length - 1) {
      onSetIndex(currentIndex + 1);
      setShowNotes(false);
      setShowReference(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      onSetIndex(currentIndex - 1);
      setShowNotes(false);
      setShowReference(false);
    }
  };

  const handleClassification = (classification: Classification) => {
    if (currentClassification === classification) {
      onSetClassification(question.id, null);
    } else {
      onSetClassification(question.id, classification);
    }
  };

  const handleImportance = (importance: number) => {
    if (currentImportance === importance) {
      onSetImportance(question.id, null);
    } else {
      onSetImportance(question.id, importance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-shore-navy border-b border-shore-slate/30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => onNavigate('welcome')}
              className="text-sm text-shore-mist/70 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Home
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-shore-mist/70">
                Draft Score: <span className="font-semibold text-white">{draftOverall}/100</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate('review')}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                >
                  Review
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className="rounded-lg bg-shore-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-shore-teal/80"
                >
                  Results
                </button>
              </div>
            </div>
          </div>
          <Stepper
            currentIndex={currentIndex}
            state={state}
            onJump={(i) => { onSetIndex(i); setShowNotes(false); setShowReference(false); }}
          />
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={completionProgress} size="sm" color="bg-shore-teal" />
            <span className="text-xs text-shore-mist/70 whitespace-nowrap">
              {answeredCount}/40 answered
            </span>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Intro */}
        {isNewCategory && (
          <div className="mb-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[question.category] || 'bg-gray-100 text-gray-700'}`}>
                {question.category}
              </span>
            </div>
            <p className="text-sm text-shore-slate">{categoryDesc}</p>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[question.category] || 'bg-gray-100 text-gray-700'}`}>
                {question.category}
              </span>
              <span className="text-xs text-gray-400">
                Question {currentIndex + 1} of {CANONICAL_QUESTIONS.length}
              </span>
            </div>
            <h2 className="text-lg font-bold text-shore-navy leading-snug">
              {question.text}
            </h2>
          </div>

          {/* Part 1: Classification (2x2 Grid) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-shore-navy mb-1">
              Part 1: How would you classify this area?
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Is this a foundational gap, an optimization opportunity, both, or not an issue?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CLASSIFICATION_CARDS.map((card) => {
                const isSelected = currentClassification === card.value;
                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => handleClassification(card.value)}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      isSelected ? card.selectedColor : card.color
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{card.icon}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {CLASSIFICATION_LABELS[card.value]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">
                      {CLASSIFICATION_DESCRIPTIONS[card.value]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 2: Importance (1-5 scale) */}
          <div className={`mb-6 transition-opacity ${isNotAnIssue ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="text-sm font-semibold text-shore-navy mb-1">
              Part 2: How important is this to address?
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {isNotAnIssue ? 'Auto-set to 0 because this is not an issue.' : 'Rate the relative importance of addressing this area.'}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const isSelected = currentImportance === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleImportance(level)}
                    disabled={isNotAnIssue}
                    className={`flex-1 rounded-xl border-2 py-3 text-center transition-all ${
                      isSelected
                        ? 'border-shore-navy bg-shore-navy text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-shore-teal/50 hover:bg-shore-mist/30'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span className="text-lg font-bold block">{level}</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-shore-mist/80' : 'text-gray-400'}`}>
                      {IMPORTANCE_LABELS[level]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score Reference Box */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowReference(!showReference)}
              className="text-xs text-shore-slate hover:text-shore-navy flex items-center gap-1"
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${showReference ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              Score Reference
            </button>
            {showReference && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-shore-navy">Classification Reference:</p>
                {(['hygienic', 'optimization', 'both', 'not-an-issue'] as Classification[]).map((c) => (
                  <div key={c} className="text-xs text-gray-600">
                    <span className="font-medium text-gray-700">{CLASSIFICATION_LABELS[c]}:</span>{' '}
                    {CLASSIFICATION_DESCRIPTIONS[c]}
                  </div>
                ))}
                <p className="text-xs font-semibold text-shore-navy mt-3">Importance Scale:</p>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="text-xs text-gray-600">
                    <span className="font-medium text-gray-700">{level} — {IMPORTANCE_LABELS[level]}:</span>{' '}
                    {RATING_DESCRIPTIONS[level]}
                  </div>
                ))}
              </div>
            )}

            {/* Optional Notes */}
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-xs text-shore-slate hover:text-shore-navy flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add notes or context
                {currentNotes && <span className="ml-1 text-shore-teal">(has notes)</span>}
              </button>
            ) : (
              <div>
                <label className="block text-xs font-medium text-shore-slate mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={currentNotes}
                  onChange={(e) => onSetNotes(question.id, e.target.value)}
                  placeholder="Add any context, evidence, or observations..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-shore-teal focus:outline-none focus:ring-1 focus:ring-shore-teal/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNotes(false)}
                  className="text-xs text-gray-400 mt-1 hover:text-gray-600"
                >
                  collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {CANONICAL_QUESTIONS.length}
          </span>

          {currentIndex === CANONICAL_QUESTIONS.length - 1 ? (
            <button
              onClick={() => onNavigate('review')}
              className="inline-flex items-center gap-1 rounded-xl bg-shore-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-shore-teal/80 transition-colors"
            >
              Review All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1 rounded-xl bg-shore-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-shore-slate transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
