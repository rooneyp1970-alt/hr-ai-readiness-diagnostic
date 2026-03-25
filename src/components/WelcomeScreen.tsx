'use client';

import { useRef } from 'react';
import { AssessmentState } from '../lib/types';
import { importStateJSON, exportStateJSON } from '../lib/storage';
import Logo from './Logo';

interface WelcomeScreenProps {
  hasExisting: boolean;
  lastSaved: string | null;
  state: AssessmentState | null;
  onStartNew: () => void;
  onResume: () => void;
  onImport: (state: AssessmentState) => void;
  onReset: () => void;
}

export default function WelcomeScreen({
  hasExisting,
  lastSaved,
  state,
  onStartNew,
  onResume,
  onImport,
  onReset,
}: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importStateJSON(reader.result as string);
        onImport(imported);
      } catch {
        alert('Invalid assessment file. Please select a valid .json export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    if (!state) return;
    const json = exportStateJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-ai-readiness-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-shore-mist to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-shore-navy mb-2">
            Where are you most likely to benefit from using AI?
          </h1>
          <p className="text-shore-slate text-sm leading-relaxed max-w-md mx-auto">
            A strategic diagnostic for CHROs, VPs of HR, and HR Operations leaders.
            Identify AI readiness gaps, prioritize opportunities by function,
            and receive a tailored roadmap.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          {/* Resume existing */}
          {hasExisting && lastSaved ? (
            <>
              <div className="rounded-lg bg-shore-tidefoam/30 border border-shore-teal/30 p-4 mb-4">
                <div className="flex items-center gap-2 text-shore-teal">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-sm">Assessment in progress</span>
                </div>
                <p className="text-shore-slate text-sm mt-1">
                  Last saved: {formatDate(lastSaved)}
                </p>
              </div>
              <button
                onClick={onResume}
                className="w-full rounded-xl bg-shore-navy px-4 py-3 text-sm font-semibold text-white hover:bg-shore-slate transition-colors shadow-sm"
              >
                Resume Assessment
              </button>
            </>
          ) : null}

          {/* Start new */}
          <button
            onClick={() => {
              if (hasExisting) {
                if (confirm('This will reset your current assessment. Are you sure?')) {
                  onStartNew();
                }
              } else {
                onStartNew();
              }
            }}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors shadow-sm ${
              hasExisting
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-shore-navy text-white hover:bg-shore-slate'
            }`}
          >
            {hasExisting ? 'Start New Assessment' : 'Begin Assessment'}
          </button>

          {/* Import / Export / Reset */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Import Assessment (.json)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            {hasExisting && (
              <>
                <button
                  onClick={handleExport}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Export Current Assessment (.json)
                </button>
                <button
                  onClick={() => {
                    if (confirm('This will permanently delete your assessment data. Are you sure?')) {
                      onReset();
                    }
                  }}
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  Reset Assessment
                </button>
              </>
            )}
          </div>
        </div>

        {/* Assessment overview */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-shore-navy mb-3">What this diagnostic covers</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-shore-slate">
            {[
              '8 HR function categories',
              '40 strategic questions',
              'AI Readiness Score (1-100)',
              'AI Opportunity by function',
              'Risk of Inaction analysis',
              '30-60-90 day roadmap',
              'Prioritized recommendations',
              'Downloadable PDF report',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-shore-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-shore-slate mt-6">
          Shore GTM &mdash; All data stored locally in your browser. No server required.
        </p>
      </div>
    </div>
  );
}
