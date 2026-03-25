// ─── Core Types ─────────────────────────────────────────────────────────────

export type Category =
  | 'Talent Acquisition'
  | 'Onboarding'
  | 'Payroll'
  | 'Benefits'
  | 'Learning and Development'
  | 'Performance Management'
  | 'Employee Relations and Compliance'
  | 'HR Operations and Workforce Analytics';

export type Classification = 'hygienic' | 'optimization' | 'both' | 'not-an-issue';

export interface CanonicalQuestion {
  id: string;
  category: Category;
  text: string;
  theme: string; // strategy, data, workflow, governance, adoption
  order: number; // 1-based within category
}

export interface QuestionState {
  questionId: string;
  classification: Classification | null;
  importance: number | null; // 1–5 or null; auto-zeroed when classification is 'not-an-issue'
  notes: string;
  // Derived convenience field (severity × importance), kept in sync by scoring
  rating: number | null; // legacy compat: derived combined score 0–5
}

export interface CategoryWeight {
  category: Category;
  weight: number; // percentage, default 12.5
}

export interface WeightsConfig {
  mode: 'equal' | 'custom';
  categoryWeights: CategoryWeight[];
}

export interface CategoryScore {
  category: Category;
  rawScore: number;
  normalizedScore: number; // 0–100
  answeredCount: number;
  totalCount: number;
  maturityBand: MaturityBand;
}

export type MaturityBand = 'Early Stage' | 'Emerging' | 'Operational' | 'Advanced';

export interface OpportunityScore {
  category: Category;
  readiness: number;
  valueCreation: number;
  implementationComplexity: number;
  riskLevel: number;
  recommendedPace: string;
  overallOpportunity: number;
}

export interface RiskOfInaction {
  overall: number;
  factors: { label: string; score: number }[];
}

export interface FinalSnapshot {
  timestamp: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  opportunityScores: OpportunityScore[];
  riskOfInaction: RiskOfInaction;
  strengths: { questionId: string; text: string; score: number; category: Category }[];
  gaps: { questionId: string; text: string; score: number; category: Category }[];
}

export interface AssessmentState {
  version: number;
  createdAt: string;
  lastSavedAt: string;
  challengesText: string;
  questionStates: QuestionState[];
  weightsConfig: WeightsConfig;
  finalSnapshot: FinalSnapshot | null;
  dirtyAfterFinal: boolean;
}

export interface DraftScore {
  overall: number;
  categoryScores: CategoryScore[];
  opportunityScores: OpportunityScore[];
  riskOfInaction: RiskOfInaction;
  answeredCount: number;
  totalCount: number;
}

export type Screen = 'welcome' | 'challenges' | 'splash' | 'wizard' | 'review' | 'results' | 'export' | 'settings';

// ─── Severity Mapping ──────────────────────────────────────────────────────

export const SEVERITY_MAP: Record<Classification, number> = {
  'not-an-issue': 0,
  'optimization': 0.5,
  'hygienic': 0.8,
  'both': 1.0,
};
