'use client';

import { AssessmentState, Category } from '../lib/types';
import { CANONICAL_QUESTIONS, CATEGORIES } from '../lib/questions';

interface StepperProps {
  currentIndex: number;
  state: AssessmentState;
  onJump: (index: number) => void;
}

const CATEGORY_SHORT: Record<Category, string> = {
  'Talent Acquisition': 'TA',
  'Onboarding': 'ONB',
  'Payroll': 'PAY',
  'Benefits': 'BEN',
  'Learning and Development': 'L&D',
  'Performance Management': 'PM',
  'Employee Relations and Compliance': 'ER',
  'HR Operations and Workforce Analytics': 'OPS',
};

export default function Stepper({ currentIndex, state, onJump }: StepperProps) {
  const currentQuestion = CANONICAL_QUESTIONS[currentIndex];

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => {
        const questions = CANONICAL_QUESTIONS.filter((q) => q.category === cat);
        const firstIndex = CANONICAL_QUESTIONS.indexOf(questions[0]);
        const isCurrent = currentQuestion.category === cat;
        const answeredCount = questions.filter((q) => {
          const qs = state.questionStates.find((s) => s.questionId === q.id);
          return qs?.classification !== null && qs?.classification !== undefined;
        }).length;
        const allAnswered = answeredCount === questions.length;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onJump(firstIndex)}
            className={`flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              isCurrent
                ? 'bg-shore-teal text-white'
                : allAnswered
                  ? 'bg-shore-teal/20 text-shore-teal'
                  : 'bg-white/10 text-shore-mist/70 hover:bg-white/20'
            }`}
            title={cat}
          >
            {CATEGORY_SHORT[cat]}
            {answeredCount > 0 && (
              <span className="ml-1 opacity-70">{answeredCount}/{questions.length}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
