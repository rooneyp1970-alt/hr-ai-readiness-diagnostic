import { CanonicalQuestion, Category, Classification } from './types';

interface QuestionDef {
  text: string;
  theme: string;
}

const TALENT_ACQUISITION: QuestionDef[] = [
  {
    text: 'How standardized are recruiting workflows across business units, geographies, and hiring managers?',
    theme: 'workflow',
  },
  {
    text: 'How reliable and accessible is applicant, interview, and hiring outcome data?',
    theme: 'data',
  },
  {
    text: 'How clearly are roles, approvals, and decision points defined across the recruiting process?',
    theme: 'strategy',
  },
  {
    text: 'How prepared is the organization to use AI in recruiting with appropriate governance, bias awareness, and human oversight?',
    theme: 'governance',
  },
  {
    text: 'How ready are recruiters and hiring managers to adopt AI tools in day-to-day hiring workflows?',
    theme: 'adoption',
  },
];

const ONBOARDING: QuestionDef[] = [
  {
    text: 'How consistent is the onboarding experience across teams, managers, and locations?',
    theme: 'workflow',
  },
  {
    text: 'How well documented are onboarding tasks, workflows, and ownership across HR, IT, payroll, and managers?',
    theme: 'data',
  },
  {
    text: 'How connected are the systems involved in onboarding?',
    theme: 'strategy',
  },
  {
    text: 'How suitable is current onboarding content for AI-assisted guidance, personalization, or self-service support?',
    theme: 'governance',
  },
  {
    text: 'How prepared are HR teams and managers to adopt AI-enabled onboarding workflows responsibly?',
    theme: 'adoption',
  },
];

const PAYROLL: QuestionDef[] = [
  {
    text: 'How accurate, timely, and complete is payroll data across systems and pay cycles?',
    theme: 'data',
  },
  {
    text: 'How clearly are payroll processes, controls, approvals, and exception workflows documented?',
    theme: 'workflow',
  },
  {
    text: 'How integrated are payroll systems with timekeeping, HRIS, benefits, and finance systems?',
    theme: 'strategy',
  },
  {
    text: 'How strong are governance, privacy, and review controls for introducing AI into payroll-related workflows?',
    theme: 'governance',
  },
  {
    text: 'How prepared is the payroll function to use AI for inquiry support, anomaly detection, or operational efficiency?',
    theme: 'adoption',
  },
];

const BENEFITS: QuestionDef[] = [
  {
    text: 'How easy is it for employees to access accurate and current benefits information?',
    theme: 'workflow',
  },
  {
    text: 'How structured and up to date is benefits documentation, policy content, and plan information?',
    theme: 'data',
  },
  {
    text: 'How prepared are your systems and vendor relationships to support AI-enabled benefits self-service?',
    theme: 'strategy',
  },
  {
    text: 'How clearly defined are compliance and communication guardrails for AI use in benefits-related interactions?',
    theme: 'governance',
  },
  {
    text: 'How ready is the benefits function to implement and manage AI-enabled employee support?',
    theme: 'adoption',
  },
];

const LEARNING_AND_DEVELOPMENT: QuestionDef[] = [
  {
    text: 'How clearly defined are workforce skills priorities and learning objectives?',
    theme: 'strategy',
  },
  {
    text: 'How organized and reusable is current learning content for AI-assisted creation or personalization?',
    theme: 'data',
  },
  {
    text: 'How effectively do you measure learning participation, completion, and business impact today?',
    theme: 'workflow',
  },
  {
    text: 'How prepared are leaders and employees to use AI for learning support, coaching, or content development?',
    theme: 'adoption',
  },
  {
    text: 'How well are quality, intellectual property, and governance controls in place for AI-generated learning materials?',
    theme: 'governance',
  },
];

const PERFORMANCE_MANAGEMENT: QuestionDef[] = [
  {
    text: 'How standardized are performance review processes, expectations, and evaluation criteria across the organization?',
    theme: 'workflow',
  },
  {
    text: 'How reliable and usable is performance data across teams and systems?',
    theme: 'data',
  },
  {
    text: 'How appropriate are current workflows for AI support in drafting, summarizing, or preparing performance materials?',
    theme: 'strategy',
  },
  {
    text: 'How clearly defined are ethical boundaries and human decision requirements for AI in performance management?',
    theme: 'governance',
  },
  {
    text: 'How prepared are managers and HR leaders to use AI as a support tool without weakening judgment or fairness?',
    theme: 'adoption',
  },
];

const EMPLOYEE_RELATIONS: QuestionDef[] = [
  {
    text: 'How accessible, current, and well organized are HR policies, procedures, and compliance documentation?',
    theme: 'data',
  },
  {
    text: 'How consistently are employee relations issues documented, categorized, and resolved?',
    theme: 'workflow',
  },
  {
    text: 'How mature are controls for privacy, bias mitigation, auditability, and approvals in sensitive HR processes?',
    theme: 'governance',
  },
  {
    text: 'How confident is the HR team in determining where AI can and cannot be used in employee relations and compliance matters?',
    theme: 'strategy',
  },
  {
    text: 'How prepared is the organization to monitor, review, and govern AI-supported outputs in sensitive HR cases?',
    theme: 'adoption',
  },
];

const HR_OPERATIONS: QuestionDef[] = [
  {
    text: 'How standardized and documented are core HR service delivery workflows?',
    theme: 'workflow',
  },
  {
    text: 'How clean, connected, and trustworthy is employee and workforce data across systems?',
    theme: 'data',
  },
  {
    text: 'How mature are your current reporting, analytics, and forecasting capabilities?',
    theme: 'strategy',
  },
  {
    text: 'How ready is the HR organization to use AI for workflow optimization, insights generation, and service improvement?',
    theme: 'adoption',
  },
  {
    text: 'How well governed are access, permissions, and responsible-use practices for employee data in AI-related workflows?',
    theme: 'governance',
  },
];

function buildQuestions(defs: QuestionDef[], category: Category, startId: number): CanonicalQuestion[] {
  return defs.map((d, i) => ({
    id: `q${startId + i}`,
    category,
    text: d.text,
    theme: d.theme,
    order: i + 1,
  }));
}

export const CANONICAL_QUESTIONS: CanonicalQuestion[] = [
  ...buildQuestions(TALENT_ACQUISITION, 'Talent Acquisition', 1),
  ...buildQuestions(ONBOARDING, 'Onboarding', 6),
  ...buildQuestions(PAYROLL, 'Payroll', 11),
  ...buildQuestions(BENEFITS, 'Benefits', 16),
  ...buildQuestions(LEARNING_AND_DEVELOPMENT, 'Learning and Development', 21),
  ...buildQuestions(PERFORMANCE_MANAGEMENT, 'Performance Management', 26),
  ...buildQuestions(EMPLOYEE_RELATIONS, 'Employee Relations and Compliance', 31),
  ...buildQuestions(HR_OPERATIONS, 'HR Operations and Workforce Analytics', 36),
];

export const CATEGORIES: Category[] = [
  'Talent Acquisition',
  'Onboarding',
  'Payroll',
  'Benefits',
  'Learning and Development',
  'Performance Management',
  'Employee Relations and Compliance',
  'HR Operations and Workforce Analytics',
];

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  'Talent Acquisition':
    'Measures how ready recruiting is for AI-supported sourcing, screening support, candidate communication, scheduling, and recruiter productivity.',
  'Onboarding':
    'Measures readiness for AI-assisted onboarding coordination, documentation, communication, and employee support.',
  'Payroll':
    'Measures readiness for AI in payroll service, validation, inquiry support, exception detection, and process efficiency.',
  'Benefits':
    'Measures readiness for AI-enabled benefits communication, employee self-service, plan guidance, and administrative efficiency.',
  'Learning and Development':
    'Measures readiness for AI in learning content creation, coaching support, skills development, and knowledge access.',
  'Performance Management':
    'Measures readiness for AI-supported review preparation, manager enablement, feedback drafting, and performance insights.',
  'Employee Relations and Compliance':
    'Measures readiness for AI in policy support, documentation, case support, compliance workflows, and risk management.',
  'HR Operations and Workforce Analytics':
    'Measures readiness for AI in HR service delivery, reporting, forecasting, workflow optimization, and decision support.',
};

export const AI_OPPORTUNITY_AREAS: Record<Category, string[]> = {
  'Talent Acquisition': ['Sourcing support', 'Candidate communication', 'Interview scheduling', 'Recruiter productivity'],
  'Onboarding': ['Personalized onboarding guidance', 'Task coordination', 'Documentation support', 'Employee Q&A'],
  'Payroll': ['Anomaly detection', 'Payroll inquiry support', 'Exception handling assistance'],
  'Benefits': ['Employee self-service', 'Plan guidance', 'Benefits communication support'],
  'Learning and Development': ['Content creation', 'Coaching support', 'Skills recommendations', 'Knowledge access'],
  'Performance Management': ['Review summarization', 'Manager coaching prompts', 'Feedback drafting support'],
  'Employee Relations and Compliance': ['Policy search', 'Case support', 'Documentation assistance', 'Escalation guidance'],
  'HR Operations and Workforce Analytics': ['Reporting support', 'Workflow automation', 'Analytics summarization', 'Service delivery support'],
};

export function getQuestionsByCategory(category: Category): CanonicalQuestion[] {
  return CANONICAL_QUESTIONS.filter((q) => q.category === category);
}

export function getQuestionById(id: string): CanonicalQuestion | undefined {
  return CANONICAL_QUESTIONS.find((q) => q.id === id);
}

export const RATING_LABELS: Record<number, string> = {
  1: 'Not in place',
  2: 'Minimal / ad hoc',
  3: 'Developing',
  4: 'Established',
  5: 'Advanced / scalable',
};

export const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'This capability is largely absent. No formal process, documentation, or ownership exists.',
  2: 'Some informal activity exists, but it is inconsistent, undocumented, or person-dependent.',
  3: 'A defined process is in place but not consistently followed or measured across the organization.',
  4: 'The capability is well established, consistently executed, and supported by clear ownership and measurement.',
  5: 'The capability is mature, scalable, continuously improved, and ready for AI-enhanced operation.',
};

// ─── Classification Labels ─────────────────────────────────────────────────

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  'critical-gap': 'Critical Gap',
  'needs-work': 'Needs Work',
  'room-to-improve': 'Room to Improve',
  'in-good-shape': 'In Good Shape',
};

export const CLASSIFICATION_DESCRIPTIONS: Record<Classification, string> = {
  'critical-gap': 'This capability is largely absent or broken — it needs to be in place and it isn\'t.',
  'needs-work': 'We\'ve started but we\'re not where we need to be — inconsistent, undocumented, or unreliable.',
  'room-to-improve': 'This is working but could be better or more efficient — there\'s value in improving it.',
  'in-good-shape': 'This area is well handled or not relevant to your organization.',
};

export const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Low priority',
  2: 'Somewhat important',
  3: 'Moderately important',
  4: 'High priority',
  5: 'Critical / urgent',
};
