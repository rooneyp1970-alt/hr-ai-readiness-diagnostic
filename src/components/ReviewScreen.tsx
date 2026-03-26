'use client';

import { AssessmentState, Screen } from '../lib/types';
import { CANONICAL_QUESTIONS, CATEGORIES, CLASSIFICATION_LABELS, IMPORTANCE_LABELS } from '../lib/questions';
import { getQuestionCombinedScore } from '../lib/scoring';

interface ReviewScreenProps {
  state: AssessmentState;
  draftOverall: number;
  answeredCount: number;
  onJumpToQuestion: (index: number) => void;
  onNavigate: (screen: Screen) => void;
}

export default function ReviewScreen({
  state,
  draftOverall,
  answeredCount,
  onJumpToQuestion,
  onNavigate,
}: ReviewScreenProps) {
  const unanswered = CANONICAL_QUESTIONS.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-shore-navy border-b border-shore-slate/30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('wizard')}
            className="text-sm text-shore-mist/70 hover:text-white flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Continue Assessment
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-shore-mist/70">
              Draft: <span className="font-semibold text-white">{draftOverall}/100</span>
            </span>
            <button
              onClick={() => onNavigate('results')}
              className="rounded-lg bg-shore-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-shore-teal/80"
            >
              View Results
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-shore-navy mb-2">Review All Responses</h1>
        <p className="text-sm text-shore-slate mb-6">
          {answeredCount}/{CANONICAL_QUESTIONS.length} answered.
          {unanswered > 0 && ` ${unanswered} remaining — click any question to answer or revise.`}
        </p>

        {CATEGORIES.map((cat) => {
          const questions = CANONICAL_QUESTIONS.filter((q) => q.category === cat);

          return (
            <div key={cat} className="mb-6">
              <h2 className="text-sm font-bold text-shore-navy mb-2 border-b border-shore-teal/20 pb-1">
                {cat}
              </h2>
              <div className="space-y-1.5">
                {questions.map((q) => {
                  const globalIdx = CANONICAL_QUESTIONS.indexOf(q);
                  const qs = state.questionStates.find((s) => s.questionId === q.id);
                  const classification = qs?.classification;
                  const importance = qs?.importance;
                  const hasNotes = qs?.notes && qs.notes.length > 0;
                  const isAnswered = classification !== null && classification !== undefined;
                  const combined = isAnswered
                    ? getQuestionCombinedScore(classification!, importance ?? null)
                    : null;

                  return (
                    <button
                      key={q.id}
                      onClick={() => onJumpToQuestion(globalIdx)}
                      className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 bg-white border border-gray-100 hover:border-shore-teal/30 hover:bg-shore-mist/20 transition-colors"
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isAnswered
                          ? combined !== null && combined >= 3
                            ? 'bg-red-50 text-red-600'
                            : combined !== null && combined >= 1.5
                              ? 'bg-amber-50 text-amber-700'
                              : classification === 'in-good-shape'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-shore-teal/15 text-shore-teal'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {combined !== null ? combined.toFixed(1) : '—'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{q.text}</p>
                        <div className="flex items-center gap-2">
                          {isAnswered ? (
                            <span className="text-xs text-shore-slate">
                              {CLASSIFICATION_LABELS[classification!]}
                              {classification !== 'in-good-shape' && importance ? ` · Importance: ${importance}` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not answered</span>
                          )}
                          {hasNotes && (
                            <span className="text-xs text-shore-teal">has notes</span>
                          )}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
