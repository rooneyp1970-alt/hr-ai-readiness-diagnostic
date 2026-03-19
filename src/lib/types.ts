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

export interface CanonicalQuestion {
  id: string;
  category: Category;
  text: string;
  theme: string; // strategy, data, workflow, governance, adoption
  order: number; // 1-based within category
}

export interface QuestionState {
  questionId: string;
  rating: number | null; // 1–5 or null if unanswered
  notes: string;
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
  rawScore: number; // 5–25
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
  strengths: { questionId: string; text: string; rating: number; category: Category }[];
  gaps: { questionId: string; text: string; rating: number; category: Category }[];
}

export interface AssessmentState {
  version: number;
  createdAt: string;
  lastSavedAt: string;
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

export type Screen = 'welcome' | 'wizard' | 'review' | 'results' | 'export' | 'settings';
