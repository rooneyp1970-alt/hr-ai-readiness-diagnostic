'use client';

import { useState } from 'react';
import { Screen } from '../lib/types';
import Logo from './Logo';

interface ChallengesScreenProps {
  challengesText: string;
  onSetChallengesText: (text: string) => void;
  onNavigate: (screen: Screen) => void;
}

export default function ChallengesScreen({
  challengesText,
  onSetChallengesText,
  onNavigate,
}: ChallengesScreenProps) {
  const [localText, setLocalText] = useState(challengesText);

  const handleContinue = () => {
    onSetChallengesText(localText);
    onNavigate('splash');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shore-mist to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-shore-navy mb-2">
            Before We Begin
          </h1>
          <p className="text-shore-slate text-sm leading-relaxed max-w-md mx-auto">
            Understanding your biggest challenges helps us connect your diagnostic results to what matters most.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-base font-semibold text-shore-navy mb-2">
              What keeps you up at night?
            </label>
            <p className="text-sm text-shore-slate mb-3">
              What are your 1-2 biggest challenges to achieving your goals?
            </p>
            <textarea
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              placeholder="e.g., We can't hire fast enough to keep up with growth... Our onboarding process is inconsistent across teams... Compliance risk from manual processes..."
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-shore-teal focus:outline-none focus:ring-2 focus:ring-shore-teal/20 resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              This is optional but helps personalize your results.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('welcome')}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 rounded-xl bg-shore-navy px-4 py-3 text-sm font-semibold text-white hover:bg-shore-slate transition-colors shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
