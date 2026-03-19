'use client';

import { useState } from 'react';
import { AssessmentState, Screen } from '../lib/types';
import { CANONICAL_QUESTIONS, CATEGORIES, CATEGORY_DESCRIPTIONS, RATING_LABELS, RATING_DESCRIPTIONS } from '../lib/questions';
import Stepper from './Stepper';
import ProgressBar from './ProgressBar';

interface WizardScreenProps {
  state: AssessmentState;
  currentIndex: number;
  onSetIndex: (i: number) => void;
  onSetRating: (questionId: string, rating: number | null) => void;
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

export default function WizardScreen({
  state,
  currentIndex,
  onSetIndex,
  onSetRating,
  onSetNotes,
  onNavigate,
  draftOverall,
  answeredCount,
}: WizardScreenProps) {
  const [showNotes, setShowNotes] = useState(false);

  const question = CANONICAL_QUESTIONS[currentIndex];
  const questionState = state.questionStates.find((qs) => qs.questionId === question.id);
  const currentRating = questionState?.rating ?? null;
  const currentNotes = questionState?.notes ?? '';

  const completionProgress = Math.round((answeredCount / CANONICAL_QUESTIONS.length) * 100);

  // Check if entering new category
  const prevQuestion = currentIndex > 0 ? CANONICAL_QUESTIONS[currentIndex - 1] : null;
  const isNewCategory = !prevQuestion || prevQuestion.category !== question.category;
  const categoryDesc = CATEGORY_DESCRIPTIONS[question.category];

  const goNext = () => {
    if (currentIndex < CANONICAL_QUESTIONS.length - 1) {
      onSetIndex(currentIndex + 1);
      setShowNotes(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      onSetIndex(currentIndex - 1);
      setShowNotes(false);
    }
  };

  const handleRating = (rating: number) => {
    if (currentRating === rating) {
      onSetRating(question.id, null); // toggle off
    } else {
      onSetRating(question.id, rating);
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
            onJump={(i) => { onSetIndex(i); setShowNotes(false); }}
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
        {/* Category Intro (shown when entering a new category) */}
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

          {/* Rating Scale */}
          <div className="space-y-2 mb-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRating(rating)}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                  currentRating === rating
                    ? 'border-shore-navy bg-shore-navy text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-shore-teal/50 hover:bg-shore-mist/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentRating === rating
                      ? 'bg-white text-shore-navy'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rating}
                  </span>
                  <div>
                    <span className="text-sm font-semibold block">{RATING_LABELS[rating]}</span>
                    <span className={`text-xs ${currentRating === rating ? 'text-shore-mist/80' : 'text-gray-400'}`}>
                      {RATING_DESCRIPTIONS[rating]}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional Notes */}
          <div className="border-t border-gray-100 pt-4">
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
