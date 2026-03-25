'use client';

import { AssessmentState, Screen, DraftScore } from '../lib/types';
import { exportStateJSON } from '../lib/storage';
import { generateCSV } from '../lib/scoring';
import { CANONICAL_QUESTIONS, CATEGORIES, CATEGORY_DESCRIPTIONS } from '../lib/questions';
import { getMaturityBand } from '../lib/scoring';
import { generatePDF } from '../lib/pdfExport';
import { generateImplications } from '../lib/implications';
import Logo from './Logo';

interface ExportScreenProps {
  state: AssessmentState;
  draftScore: DraftScore;
  onNavigate: (screen: Screen) => void;
  onReset: () => void;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportScreen({
  state,
  draftScore,
  onNavigate,
  onReset,
}: ExportScreenProps) {
  const handleExportJSON = () => {
    const json = exportStateJSON(state);
    downloadFile(json, `hr-ai-readiness-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const csv = generateCSV(state);
    downloadFile(csv, `hr-ai-readiness-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const handleExportPDF = () => {
    generatePDF(state, draftScore);
  };

  const implications = generateImplications(state, draftScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-shore-navy border-b border-shore-slate/30 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('results')}
            className="text-sm text-shore-mist/70 hover:text-white flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Results
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Export Actions */}
        <div className="mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-shore-navy mb-4">Export & Download</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button onClick={handleExportPDF} className="rounded-xl border-2 border-shore-navy bg-shore-navy p-4 text-center hover:bg-shore-slate transition-colors">
              <svg className="w-8 h-8 mx-auto text-white mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm font-semibold text-white">Download PDF</p>
              <p className="text-xs text-shore-mist/70">Executive report</p>
            </button>
            <button onClick={handleExportJSON} className="rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50 transition-colors">
              <svg className="w-8 h-8 mx-auto text-shore-navy mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <p className="text-sm font-semibold text-shore-navy">Export JSON</p>
              <p className="text-xs text-gray-500">Full backup</p>
            </button>
            <button onClick={handleExportCSV} className="rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50 transition-colors">
              <svg className="w-8 h-8 mx-auto text-shore-navy mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m0-3.75c-.621 0-1.125.504-1.125 1.125" />
              </svg>
              <p className="text-sm font-semibold text-shore-navy">Export CSV</p>
              <p className="text-xs text-gray-500">Spreadsheet</p>
            </button>
            <button onClick={() => window.print()} className="rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50 transition-colors">
              <svg className="w-8 h-8 mx-auto text-shore-navy mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-8.25 0h.008v.008H10.5V12z" />
              </svg>
              <p className="text-sm font-semibold text-shore-navy">Print</p>
              <p className="text-xs text-gray-500">Print view</p>
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => {
              if (confirm('This will permanently delete all assessment data. Are you sure?')) {
                onReset();
              }
            }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Reset Assessment
          </button>
        </div>

        {/* Printable Report */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 print:border-none print:shadow-none print:p-0">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-shore-navy">HR AI Readiness and Opportunity Diagnostic</h1>
            <p className="text-gray-500 text-sm mt-1">
              Shore GTM | Generated {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-8 p-6 rounded-xl bg-shore-mist/30 border border-shore-teal/20">
            <p className="text-5xl font-bold text-shore-navy mb-1">{draftScore.overall}</p>
            <p className="text-gray-500 text-sm">Overall HR AI Readiness Score — {getMaturityBand(draftScore.overall)}</p>
            <p className="text-xs text-gray-400 mt-1">{draftScore.answeredCount}/{draftScore.totalCount} questions answered</p>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {draftScore.categoryScores.map((cs) => (
              <div key={cs.category} className="text-center p-3 rounded-lg border border-gray-200">
                <p className="text-xl font-bold text-shore-navy">{cs.normalizedScore}</p>
                <p className="text-[10px] text-shore-slate">{cs.category}</p>
                <p className="text-[9px] text-gray-400">{cs.maturityBand}</p>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-shore-navy mb-2 border-b border-shore-teal/20 pb-1">Executive Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{implications.executiveSummary}</p>
          </div>

          {/* Category Details */}
          {implications.categoryImplications.map((ci) => (
            <div key={ci.category} className="mb-6">
              <h3 className="text-sm font-bold text-shore-navy mb-1">{ci.category} — {ci.score}/100 ({ci.band})</h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-2">{ci.narrative}</p>
              <p className="text-xs text-gray-600 leading-relaxed"><strong>AI Opportunity:</strong> {ci.aiOpportunity}</p>
            </div>
          ))}

          {/* Risk of Inaction */}
          <div className="mb-8 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-bold text-shore-navy mb-2">Risk of Inaction</h2>
            {implications.riskOfInactionNarrative.map((block, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{block}</p>
            ))}
          </div>

          {/* Recommendations */}
          <div className="mb-8 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-bold text-shore-navy mb-2">Priority Recommendations</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              {implications.prioritizedRecommendations.map((rec, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed">{rec}</li>
              ))}
            </ol>
          </div>

          {/* Roadmap */}
          <div className="mb-8 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-bold text-shore-navy mb-3">30-60-90 Day Roadmap</h2>
            {implications.roadmap.map((phase) => (
              <div key={phase.label} className="mb-4">
                <h3 className="text-sm font-semibold text-shore-navy mb-1">{phase.label} — {phase.timeframe}</h3>
                <ul className="list-disc list-inside space-y-0.5">
                  {phase.actions.map((a, i) => (
                    <li key={i} className="text-xs text-gray-700">{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-bold text-shore-navy mb-2">Immediate Next Steps</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              {implications.immediateNextSteps.map((step, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
