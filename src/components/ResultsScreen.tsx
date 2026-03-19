'use client';

import { AssessmentState, Screen, DraftScore, FinalSnapshot } from '../lib/types';
import { CANONICAL_QUESTIONS } from '../lib/questions';
import { getMaturityBand } from '../lib/scoring';
import { generateImplications } from '../lib/implications';
import ProgressBar from './ProgressBar';
import RadarChart from './RadarChart';

interface ResultsScreenProps {
  state: AssessmentState;
  draftScore: DraftScore;
  onCalculateFinal: () => void;
  onNavigate: (screen: Screen) => void;
  onJumpToQuestion: (index: number) => void;
}

function ScoreGauge({ score, label, sub }: { score: number; label: string; sub?: string }) {
  const color =
    score > 75 ? 'text-shore-teal' :
    score > 50 ? 'text-shore-navy' :
    score > 25 ? 'text-amber-600' : 'text-coral';

  const bgColor =
    score > 75 ? 'from-emerald-50 to-emerald-100/50 border-shore-teal/30' :
    score > 50 ? 'from-blue-50 to-blue-100/50 border-shore-navy/20' :
    score > 25 ? 'from-yellow-50 to-yellow-100/50 border-amber-200' :
    'from-red-50 to-red-100/50 border-red-200';

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${bgColor} p-4 text-center`}>
      <p className={`text-3xl font-bold ${color}`}>{score}</p>
      <p className="text-xs text-gray-600 mt-1 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

function BandBadge({ score }: { score: number }) {
  const band = getMaturityBand(score);
  const colors: Record<string, string> = {
    'Early Stage': 'bg-red-100 text-red-700',
    'Emerging': 'bg-amber-100 text-amber-700',
    'Operational': 'bg-blue-100 text-blue-700',
    'Advanced': 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[band]}`}>
      {band}
    </span>
  );
}

export default function ResultsScreen({
  state,
  draftScore,
  onCalculateFinal,
  onNavigate,
  onJumpToQuestion,
}: ResultsScreenProps) {
  const { finalSnapshot, dirtyAfterFinal } = state;
  const unanswered = draftScore.totalCount - draftScore.answeredCount;
  const implications = generateImplications(state, draftScore);

  const handleJump = (index: number) => {
    onJumpToQuestion(index);
    onNavigate('wizard');
  };

  // Category bar colors
  const catBarColors: Record<string, string> = {
    'Talent Acquisition': 'bg-shore-teal',
    'Onboarding': 'bg-blue-500',
    'Payroll': 'bg-purple-500',
    'Benefits': 'bg-emerald-500',
    'Learning and Development': 'bg-amber-500',
    'Performance Management': 'bg-rose-500',
    'Employee Relations and Compliance': 'bg-orange-500',
    'HR Operations and Workforce Analytics': 'bg-shore-navy',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-shore-navy border-b border-shore-slate/30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('review')}
            className="text-sm text-shore-mist/70 hover:text-white flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Review
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('settings')}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              Weights
            </button>
            <button
              onClick={() => onNavigate('export')}
              className="rounded-lg bg-shore-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-shore-teal/80"
            >
              Export & PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Dirty Banner */}
        {dirtyAfterFinal && finalSnapshot && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">
              Changes made since final score. Recalculate to update.
            </span>
            <button onClick={onCalculateFinal} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
              Recalculate
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold text-shore-navy">Results Dashboard</h1>

        {/* Score Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ScoreGauge score={draftScore.overall} label="Overall Readiness" sub={getMaturityBand(draftScore.overall)} />
          <ScoreGauge
            score={Math.max(...draftScore.opportunityScores.map((o) => o.overallOpportunity))}
            label="Top Opportunity"
          />
          <ScoreGauge score={draftScore.riskOfInaction.overall} label="Risk of Inaction" />
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-shore-navy">{draftScore.answeredCount}/{draftScore.totalCount}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Questions Answered</p>
          </div>
        </div>

        {/* Radar Chart + Category Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-shore-navy mb-4">Readiness by Function</h2>
            <RadarChart categoryScores={draftScore.categoryScores} size={320} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-shore-navy mb-4">Category Scores</h2>
            <div className="space-y-3">
              {draftScore.categoryScores.map((cs) => (
                <div key={cs.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">{cs.category}</span>
                    <div className="flex items-center gap-2">
                      <BandBadge score={cs.normalizedScore} />
                      <span className="text-xs font-bold text-shore-navy">{cs.normalizedScore}</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={cs.normalizedScore}
                    size="sm"
                    color={catBarColors[cs.category] || 'bg-shore-teal'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Opportunity by Function */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-shore-navy mb-4">AI Opportunity by HR Function</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-shore-slate border-b border-gray-100">
                  <th className="pb-2 font-medium">Function</th>
                  <th className="pb-2 font-medium text-center">Readiness</th>
                  <th className="pb-2 font-medium text-center">Opportunity</th>
                  <th className="pb-2 font-medium text-center">Value</th>
                  <th className="pb-2 font-medium text-center">Complexity</th>
                  <th className="pb-2 font-medium text-center">Risk</th>
                  <th className="pb-2 font-medium">Pace</th>
                </tr>
              </thead>
              <tbody>
                {draftScore.opportunityScores.map((os) => (
                  <tr key={os.category} className="border-b border-gray-50">
                    <td className="py-2 text-gray-800 font-medium text-xs">{os.category}</td>
                    <td className="py-2 text-center"><BandBadge score={os.readiness} /></td>
                    <td className="py-2 text-center font-semibold text-xs">{os.overallOpportunity}</td>
                    <td className="py-2 text-center text-xs">{os.valueCreation}</td>
                    <td className="py-2 text-center text-xs">{os.implementationComplexity}</td>
                    <td className="py-2 text-center text-xs">{os.riskLevel}</td>
                    <td className="py-2 text-xs text-shore-slate">{os.recommendedPace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-shore-teal/30 bg-white p-4">
            <h3 className="text-sm font-semibold text-shore-navy mb-2">Top Strengths</h3>
            {draftScore.answeredCount === 0 ? (
              <p className="text-sm text-gray-400">Answer questions to see strengths</p>
            ) : (
              <ul className="space-y-1.5">
                {(() => {
                  const answered = CANONICAL_QUESTIONS
                    .map((q) => ({ ...q, rating: state.questionStates.find((s) => s.questionId === q.id)?.rating }))
                    .filter((q) => q.rating !== null && q.rating !== undefined)
                    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                    .slice(0, 5);
                  return answered.map((q) => {
                    const idx = CANONICAL_QUESTIONS.findIndex((c) => c.id === q.id);
                    return (
                      <li key={q.id}>
                        <button onClick={() => handleJump(idx)} className="w-full text-left flex items-center justify-between rounded-lg px-2 py-1 hover:bg-gray-50">
                          <span className="text-xs text-gray-700 truncate flex-1">{q.category}: {q.text.slice(0, 60)}...</span>
                          <span className="text-xs font-semibold text-shore-teal ml-2">{q.rating}/5</span>
                        </button>
                      </li>
                    );
                  });
                })()}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-coral/30 bg-white p-4">
            <h3 className="text-sm font-semibold text-shore-navy mb-2">Top Gaps</h3>
            {draftScore.answeredCount === 0 ? (
              <p className="text-sm text-gray-400">Answer questions to see gaps</p>
            ) : (
              <ul className="space-y-1.5">
                {(() => {
                  const answered = CANONICAL_QUESTIONS
                    .map((q) => ({ ...q, rating: state.questionStates.find((s) => s.questionId === q.id)?.rating }))
                    .filter((q) => q.rating !== null && q.rating !== undefined)
                    .sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))
                    .slice(0, 5);
                  return answered.map((q) => {
                    const idx = CANONICAL_QUESTIONS.findIndex((c) => c.id === q.id);
                    return (
                      <li key={q.id}>
                        <button onClick={() => handleJump(idx)} className="w-full text-left flex items-center justify-between rounded-lg px-2 py-1 hover:bg-gray-50">
                          <span className="text-xs text-gray-700 truncate flex-1">{q.category}: {q.text.slice(0, 60)}...</span>
                          <span className="text-xs font-semibold text-red-600 ml-2">{q.rating}/5</span>
                        </button>
                      </li>
                    );
                  });
                })()}
              </ul>
            )}
          </div>
        </div>

        {/* Calculate Final Score */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h2 className="text-lg font-bold text-shore-navy mb-2">Final Score</h2>
          {unanswered > 0 && (
            <p className="text-sm text-shore-slate mb-3">
              {unanswered} question{unanswered !== 1 ? 's' : ''} unanswered. You can still calculate a final score based on current responses.
            </p>
          )}
          <button
            onClick={onCalculateFinal}
            className="rounded-xl bg-shore-navy px-6 py-3 text-sm font-semibold text-white hover:bg-shore-slate transition-colors"
          >
            Calculate Final Score
          </button>
        </div>

        {/* Final Snapshot */}
        {finalSnapshot && (
          <div className="rounded-xl border-2 border-shore-navy/20 bg-shore-mist/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-shore-navy">Final Score Snapshot</h2>
              <span className="text-xs text-shore-slate">
                Calculated: {new Date(finalSnapshot.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ScoreGauge score={finalSnapshot.overallScore} label="Final Overall" sub={getMaturityBand(finalSnapshot.overallScore)} />
              <ScoreGauge score={Math.max(...finalSnapshot.opportunityScores.map((o) => o.overallOpportunity))} label="Top Opportunity" />
              <ScoreGauge score={finalSnapshot.riskOfInaction.overall} label="Risk of Inaction" />
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <p className="text-3xl font-bold text-shore-navy">{finalSnapshot.strengths.length}</p>
                <p className="text-xs text-gray-600 mt-1">Top Strengths</p>
              </div>
            </div>
          </div>
        )}

        {/* Implications */}
        {draftScore.answeredCount > 0 && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="rounded-xl border-2 border-shore-teal/30 bg-white p-6">
              <h2 className="text-lg font-bold text-shore-navy mb-3">Executive Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{implications.executiveSummary}</p>
            </div>

            {/* Category Implications */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-shore-navy">Functional Analysis</h2>
              {implications.categoryImplications.map((ci) => (
                <details key={ci.category} className="rounded-xl border border-gray-200 bg-white">
                  <summary className="px-5 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-shore-navy">{ci.category}</span>
                      <BandBadge score={ci.score} />
                    </div>
                    <span className="text-sm font-bold text-shore-navy">{ci.score}/100</span>
                  </summary>
                  <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{ci.narrative}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-shore-teal mb-1">Strengths</h4>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {ci.strengths.map((s, i) => <li key={i}>+ {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-coral mb-1">Barriers</h4>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {ci.barriers.map((b, i) => <li key={i}>- {b}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-shore-navy mb-1">AI Opportunity</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{ci.aiOpportunity}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-shore-navy mb-1">Risk Commentary</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{ci.riskCommentary}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-shore-navy mb-1">Recommended Next Steps</h4>
                      <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                        {ci.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            {/* Risk of Inaction */}
            <div className="rounded-xl border-2 border-coral/30 bg-white p-6">
              <h2 className="text-lg font-bold text-shore-navy mb-3">Risk of Inaction</h2>
              <div className="space-y-3 mb-4">
                {implications.riskOfInactionNarrative.map((block, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{block}</p>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {draftScore.riskOfInaction.factors.slice(0, 8).map((f) => (
                  <div key={f.label} className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className={`text-lg font-bold ${f.score > 60 ? 'text-coral' : f.score > 40 ? 'text-amber-600' : 'text-shore-teal'}`}>
                      {f.score}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Recommendations */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-shore-navy mb-3">Priority Recommendations</h2>
              <ol className="space-y-3">
                {implications.prioritizedRecommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-shore-navy text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* 30-60-90 Roadmap */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-shore-navy mb-4">30-60-90 Day Roadmap</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {implications.roadmap.map((phase) => (
                  <div key={phase.label} className="rounded-lg border border-shore-teal/20 bg-shore-mist/20 p-4">
                    <h3 className="text-sm font-bold text-shore-navy mb-1">{phase.label}</h3>
                    <p className="text-[10px] text-shore-slate mb-3 uppercase tracking-wide">{phase.timeframe}</p>
                    <ul className="space-y-1.5">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-gray-700">
                          <span className="text-shore-teal flex-shrink-0 mt-0.5">&#8226;</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate Next Steps */}
            <div className="rounded-xl border-2 border-shore-navy/20 bg-white p-6">
              <h2 className="text-lg font-bold text-shore-navy mb-3">Immediate Next Steps</h2>
              <ol className="space-y-2">
                {implications.immediateNextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-shore-teal text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
