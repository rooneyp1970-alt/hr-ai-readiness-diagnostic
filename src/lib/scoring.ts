import {
  AssessmentState,
  Category,
  CategoryScore,
  Classification,
  DraftScore,
  FinalSnapshot,
  MaturityBand,
  OpportunityScore,
  RiskOfInaction,
  SEVERITY_MAP,
} from './types';
import { CANONICAL_QUESTIONS, CATEGORIES, getQuestionsByCategory } from './questions';

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getQuestionCombinedScore(
  classification: Classification | null,
  importance: number | null
): number {
  if (!classification || classification === 'in-good-shape') return 0;
  const severity = SEVERITY_MAP[classification];
  const imp = importance ?? 0;
  return severity * imp; // 0–5 range
}

// ─── Maturity Band ──────────────────────────────────────────────────────────

export function getMaturityBand(score: number): MaturityBand {
  if (score <= 25) return 'Early Stage';
  if (score <= 50) return 'Emerging';
  if (score <= 75) return 'Operational';
  return 'Advanced';
}

// ─── Category Score ─────────────────────────────────────────────────────────

function computeCategoryScore(category: Category, state: AssessmentState): CategoryScore {
  const questions = getQuestionsByCategory(category);
  const scores: number[] = [];

  for (const q of questions) {
    const qs = state.questionStates.find((s) => s.questionId === q.id);
    if (qs?.classification !== null && qs?.classification !== undefined) {
      scores.push(getQuestionCombinedScore(qs.classification, qs.importance));
    }
  }

  const rawScore = scores.reduce((sum, s) => sum + s, 0);
  // Normalize: max possible per answered question is 5 (severity 1.0 × importance 5)
  let normalizedScore = 0;
  if (scores.length > 0) {
    const maxPossible = scores.length * 5;
    normalizedScore = Math.round((rawScore / maxPossible) * 100);
  }

  return {
    category,
    rawScore: Math.round(rawScore * 100) / 100,
    normalizedScore,
    answeredCount: scores.length,
    totalCount: questions.length,
    maturityBand: getMaturityBand(normalizedScore),
  };
}

// ─── Overall Score ──────────────────────────────────────────────────────────

function computeOverallScore(categoryScores: CategoryScore[], state: AssessmentState): number {
  const { weightsConfig } = state;

  if (weightsConfig.mode === 'equal') {
    const totalNorm = categoryScores.reduce((sum, cs) => sum + cs.normalizedScore, 0);
    const answered = categoryScores.filter((cs) => cs.answeredCount > 0).length;
    if (answered === 0) return 0;
    return Math.round(totalNorm / answered);
  }

  // Custom weighted mode
  let weightedSum = 0;
  let totalWeight = 0;

  for (const cs of categoryScores) {
    if (cs.answeredCount === 0) continue;
    const cw = weightsConfig.categoryWeights.find((w) => w.category === cs.category);
    const weight = cw?.weight ?? 12.5;
    weightedSum += cs.normalizedScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

// ─── AI Opportunity Scoring ─────────────────────────────────────────────────

const INHERENT_OPPORTUNITY: Record<Category, { volume: number; repetitiveness: number; valuePotential: number; feasibility: number }> = {
  'Talent Acquisition':                      { volume: 85, repetitiveness: 75, valuePotential: 90, feasibility: 80 },
  'Onboarding':                              { volume: 70, repetitiveness: 80, valuePotential: 75, feasibility: 85 },
  'Payroll':                                 { volume: 90, repetitiveness: 95, valuePotential: 70, feasibility: 70 },
  'Benefits':                                { volume: 75, repetitiveness: 80, valuePotential: 65, feasibility: 80 },
  'Learning and Development':                { volume: 70, repetitiveness: 60, valuePotential: 85, feasibility: 75 },
  'Performance Management':                  { volume: 65, repetitiveness: 70, valuePotential: 80, feasibility: 70 },
  'Employee Relations and Compliance':       { volume: 55, repetitiveness: 50, valuePotential: 75, feasibility: 55 },
  'HR Operations and Workforce Analytics':   { volume: 85, repetitiveness: 80, valuePotential: 90, feasibility: 80 },
};

function computeOpportunityScore(category: Category, categoryScore: CategoryScore): OpportunityScore {
  const inherent = INHERENT_OPPORTUNITY[category];
  const readiness = categoryScore.normalizedScore;

  const painLevel = Math.max(0, 100 - readiness);
  const valueCreation = Math.round((inherent.valuePotential * 0.6 + painLevel * 0.4));
  const complexity = Math.round(100 - (readiness * 0.4 + inherent.feasibility * 0.6));

  const sensitivityBonus = ['Employee Relations and Compliance', 'Payroll', 'Performance Management'].includes(category) ? 15 : 0;
  const riskLevel = Math.min(100, Math.round(complexity * 0.5 + sensitivityBonus + (100 - readiness) * 0.3));

  let recommendedPace = 'Accelerate';
  if (readiness < 25) recommendedPace = 'Build foundations first';
  else if (readiness < 50) recommendedPace = 'Prepare, then pilot';
  else if (readiness < 75) recommendedPace = 'Pilot and scale';
  else recommendedPace = 'Scale and optimize';

  const overallOpportunity = Math.round(
    valueCreation * 0.35 +
    (inherent.volume * 0.15) +
    (inherent.repetitiveness * 0.15) +
    (100 - complexity) * 0.2 +
    painLevel * 0.15
  );

  return {
    category,
    readiness,
    valueCreation,
    implementationComplexity: complexity,
    riskLevel,
    recommendedPace,
    overallOpportunity,
  };
}

// ─── Risk of Inaction ───────────────────────────────────────────────────────

function computeRiskOfInaction(categoryScores: CategoryScore[]): RiskOfInaction {
  const avgReadiness = categoryScores.length > 0
    ? categoryScores.reduce((sum, cs) => sum + cs.normalizedScore, 0) / categoryScores.length
    : 50;

  const taScore = categoryScores.find((c) => c.category === 'Talent Acquisition')?.normalizedScore ?? 50;
  const onbScore = categoryScores.find((c) => c.category === 'Onboarding')?.normalizedScore ?? 50;
  const payScore = categoryScores.find((c) => c.category === 'Payroll')?.normalizedScore ?? 50;
  const benScore = categoryScores.find((c) => c.category === 'Benefits')?.normalizedScore ?? 50;
  const ldScore = categoryScores.find((c) => c.category === 'Learning and Development')?.normalizedScore ?? 50;
  const pmScore = categoryScores.find((c) => c.category === 'Performance Management')?.normalizedScore ?? 50;
  const erScore = categoryScores.find((c) => c.category === 'Employee Relations and Compliance')?.normalizedScore ?? 50;
  const opsScore = categoryScores.find((c) => c.category === 'HR Operations and Workforce Analytics')?.normalizedScore ?? 50;

  const factors = [
    { label: 'Lower HR productivity', score: Math.round(100 - (opsScore * 0.6 + avgReadiness * 0.4)) },
    { label: 'Slower hiring and onboarding', score: Math.round(100 - (taScore * 0.5 + onbScore * 0.5)) },
    { label: 'Higher administrative burden', score: Math.round(100 - (opsScore * 0.5 + payScore * 0.3 + benScore * 0.2)) },
    { label: 'Inconsistent employee experience', score: Math.round(100 - (onbScore * 0.3 + benScore * 0.3 + pmScore * 0.2 + ldScore * 0.2)) },
    { label: 'Increased compliance exposure', score: Math.round(100 - (erScore * 0.7 + payScore * 0.3)) },
    { label: 'Talent disadvantage vs. competitors', score: Math.round(100 - (taScore * 0.4 + ldScore * 0.3 + pmScore * 0.3)) },
    { label: 'Fragmented AI experimentation without governance', score: Math.round(100 - avgReadiness) },
    { label: 'Missed opportunity to modernize HR service delivery', score: Math.round(100 - (opsScore * 0.5 + avgReadiness * 0.5)) },
  ];

  const overall = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);

  return { overall, factors };
}

// ─── Draft Score Computation ────────────────────────────────────────────────

export function computeDraftScore(state: AssessmentState): DraftScore {
  const categoryScores = CATEGORIES.map((cat) => computeCategoryScore(cat, state));
  const overall = computeOverallScore(categoryScores, state);
  const opportunityScores = CATEGORIES.map((cat, i) => computeOpportunityScore(cat, categoryScores[i]));
  const riskOfInaction = computeRiskOfInaction(categoryScores);
  const answeredCount = categoryScores.reduce((sum, cs) => sum + cs.answeredCount, 0);

  return {
    overall,
    categoryScores,
    opportunityScores,
    riskOfInaction,
    answeredCount,
    totalCount: CANONICAL_QUESTIONS.length,
  };
}

// ─── Final Snapshot ─────────────────────────────────────────────────────────

export function computeFinalSnapshot(state: AssessmentState): FinalSnapshot {
  const draft = computeDraftScore(state);

  const answeredQs = CANONICAL_QUESTIONS
    .map((q) => {
      const qs = state.questionStates.find((s) => s.questionId === q.id);
      const score = qs?.classification
        ? getQuestionCombinedScore(qs.classification, qs.importance)
        : null;
      return { ...q, score };
    })
    .filter((q) => q.score !== null) as (typeof CANONICAL_QUESTIONS[number] & { score: number })[];

  const sorted = [...answeredQs].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 5).map((s) => ({
    questionId: s.id,
    text: s.text,
    score: s.score,
    category: s.category,
  }));

  const gaps = [...answeredQs]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((s) => ({
      questionId: s.id,
      text: s.text,
      score: s.score,
      category: s.category,
    }));

  return {
    timestamp: new Date().toISOString(),
    overallScore: draft.overall,
    categoryScores: draft.categoryScores,
    opportunityScores: draft.opportunityScores,
    riskOfInaction: draft.riskOfInaction,
    strengths,
    gaps,
  };
}

// ─── Initial State Factory ──────────────────────────────────────────────────

export function createInitialState(): AssessmentState {
  const now = new Date().toISOString();
  return {
    version: 3,
    createdAt: now,
    lastSavedAt: now,
    challengesText: '',
    questionStates: CANONICAL_QUESTIONS.map((q) => ({
      questionId: q.id,
      classification: null,
      importance: null,
      notes: '',
      rating: null,
    })),
    weightsConfig: {
      mode: 'equal',
      categoryWeights: CATEGORIES.map((c) => ({ category: c, weight: 12.5 })),
    },
    finalSnapshot: null,
    dirtyAfterFinal: false,
  };
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function generateCSV(state: AssessmentState): string {
  const lines: string[] = [];
  lines.push('Category,Question,Theme,Classification,Importance,Combined Score,Notes');

  for (const q of CANONICAL_QUESTIONS) {
    const qs = state.questionStates.find((s) => s.questionId === q.id);
    const classification = qs?.classification ?? '';
    const importance = qs?.importance ?? '';
    const combined = qs?.classification
      ? getQuestionCombinedScore(qs.classification, qs.importance).toFixed(2)
      : '';
    const notes = csvEscape(qs?.notes ?? '');
    lines.push(`${csvEscape(q.category)},${csvEscape(q.text)},${q.theme},${classification},${importance},${combined},${notes}`);
  }

  return lines.join('\n');
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
