'use client';

import { Screen } from '../lib/types';
import Logo from './Logo';

interface SplashScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function SplashScreen({ onNavigate }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-shore-mist to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-shore-teal/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-shore-teal" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold text-shore-navy mb-3">
              Thank you.
            </h1>
            <p className="text-sm text-shore-slate leading-relaxed">
              We&apos;re now going to ask you to assess specific organizational capabilities.
              This will help you see where using AI strategically can help clear those challenges.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-shore-slate mb-4">
              For each question, you&apos;ll assess your organization&apos;s current preparedness and rate its importance.
              There are 40 questions across 8 HR functions. Most people finish in 15-20 minutes.
            </p>
            <button
              onClick={() => onNavigate('wizard')}
              className="w-full rounded-xl bg-shore-navy px-4 py-3 text-sm font-semibold text-white hover:bg-shore-slate transition-colors shadow-sm"
            >
              Start the Diagnostic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
