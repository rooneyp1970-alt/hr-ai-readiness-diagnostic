import { AssessmentState, Category, DraftScore, MaturityBand } from './types';
import { CANONICAL_QUESTIONS, CATEGORIES, CATEGORY_DESCRIPTIONS, AI_OPPORTUNITY_AREAS, RATING_LABELS } from './questions';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryImplication {
  category: Category;
  description: string;
  score: number;
  band: MaturityBand;
  narrative: string;
  strengths: string[];
  barriers: string[];
  aiOpportunity: string;
  riskCommentary: string;
  nextSteps: string[];
}

interface RoadmapPhase {
  label: string;
  timeframe: string;
  actions: string[];
}

export interface ImplicationsResult {
  executiveSummary: string;
  categoryImplications: CategoryImplication[];
  prioritizedRecommendations: string[];
  roadmap: RoadmapPhase[];
  riskOfInactionNarrative: string[];
  immediateNextSteps: string[];
}

// ─── Narrative Generation ───────────────────────────────────────────────────

function getCategoryNarrative(category: Category, score: number, band: MaturityBand): string {
  const desc = CATEGORY_DESCRIPTIONS[category];
  switch (band) {
    case 'Early Stage':
      return `${category} scored ${score}/100, placing it in the Early Stage band. ${desc} Currently, workflows in this function are fragmented, data readiness is limited, governance is weak, and ownership of AI-related decisions is unclear. Foundational work is required before any AI pilots can be considered responsibly.`;
    case 'Emerging':
      return `${category} scored ${score}/100, placing it in the Emerging band. ${desc} Interest and pockets of experimentation may exist, but process standardization and adoption readiness are uneven. The function needs targeted investment in data quality, workflow documentation, and governance frameworks before moving to pilot-stage AI adoption.`;
    case 'Operational':
      return `${category} scored ${score}/100, placing it in the Operational band. ${desc} Strong foundations are in place, and the function is ready for focused AI pilots and initial scaled adoption. The priority now is selecting high-value use cases, establishing measurement frameworks, and ensuring governance keeps pace with adoption.`;
    case 'Advanced':
      return `${category} scored ${score}/100, placing it in the Advanced band. ${desc} The function has the maturity to scale AI responsibly and measure impact. Focus should shift to optimization, continuous improvement, and expanding AI capabilities across more complex workflows while maintaining governance standards.`;
  }
}

function getCategoryStrengths(category: Category, state: AssessmentState): string[] {
  const questions = CANONICAL_QUESTIONS.filter((q) => q.category === category);
  const strengths: string[] = [];

  for (const q of questions) {
    const qs = state.questionStates.find((s) => s.questionId === q.id);
    if (qs?.rating && qs.rating >= 4) {
      strengths.push(`${q.text.replace(/^How /, '').replace(/\?$/, '')} (${qs.rating}/5 — ${RATING_LABELS[qs.rating]})`);
    }
  }

  return strengths.length > 0 ? strengths : ['No areas rated at Established or above'];
}

function getCategoryBarriers(category: Category, state: AssessmentState): string[] {
  const questions = CANONICAL_QUESTIONS.filter((q) => q.category === category);
  const barriers: string[] = [];

  for (const q of questions) {
    const qs = state.questionStates.find((s) => s.questionId === q.id);
    if (qs?.rating && qs.rating <= 2) {
      barriers.push(`${q.text.replace(/^How /, '').replace(/\?$/, '')} (${qs.rating}/5 — ${RATING_LABELS[qs.rating]})`);
    }
  }

  return barriers.length > 0 ? barriers : ['No critical barriers identified at this time'];
}

function getCategoryAIOpportunity(category: Category, score: number): string {
  const areas = AI_OPPORTUNITY_AREAS[category];
  const areaList = areas.join(', ');

  if (score <= 25) {
    return `AI opportunity in ${category} is high, but the function is not yet ready. Priority areas include ${areaList}. Before piloting any AI use cases, invest in data quality, process standardization, and governance fundamentals. Without these foundations, AI adoption will produce unreliable results and create governance risk.`;
  }
  if (score <= 50) {
    return `${category} presents meaningful AI opportunity across ${areaList}. The function has enough foundation to begin targeted experimentation, but needs stronger data practices and clearer governance before scaling. Start with low-risk, high-visibility use cases to build confidence and demonstrate value.`;
  }
  if (score <= 75) {
    return `${category} is well positioned for AI adoption. Key opportunity areas include ${areaList}. The function has sufficient readiness to launch focused pilots with appropriate human oversight. Prioritize use cases that reduce administrative burden and improve consistency.`;
  }
  return `${category} is ready to scale AI across ${areaList}. With strong foundations in place, the focus should be on expanding AI capabilities, measuring business impact, and continuously refining governance practices to match the pace of adoption.`;
}

function getCategoryRiskCommentary(category: Category, score: number): string {
  if (score <= 25) {
    return `Significant risk exists in ${category}. Without improvement, the organization faces operational inefficiency, inconsistent practices, and growing competitive disadvantage. The longer these gaps persist, the more costly they become to close.`;
  }
  if (score <= 50) {
    return `Moderate risk in ${category}. Current gaps create unnecessary administrative burden and inconsistency. Competitors who have already addressed similar gaps operate with a structural advantage. Targeted improvements can materially reduce this risk within 90 days.`;
  }
  if (score <= 75) {
    return `Limited risk in ${category}, though remaining gaps represent missed value. The function is performing adequately, but incremental improvements can meaningfully improve efficiency, employee experience, and decision quality.`;
  }
  return `Minimal risk in ${category}. The function is well positioned. The primary risk is complacency — maintain investment in continuous improvement and governance to sustain this level of maturity.`;
}

function getCategoryNextSteps(category: Category, score: number, band: MaturityBand): string[] {
  const steps: string[] = [];

  switch (band) {
    case 'Early Stage':
      steps.push(`Document and standardize core ${category.toLowerCase()} workflows`);
      steps.push('Conduct a data quality and accessibility audit');
      steps.push('Define clear ownership and decision-making authority');
      steps.push('Establish baseline governance requirements for AI use');
      steps.push('Identify 1-2 foundational improvements that enable future AI pilots');
      break;
    case 'Emerging':
      steps.push(`Standardize inconsistent processes in ${category.toLowerCase()}`);
      steps.push('Improve data connectivity and documentation');
      steps.push('Draft initial AI governance guidelines specific to this function');
      steps.push('Identify 2-3 low-risk pilot use cases');
      steps.push('Begin building adoption readiness through training and communication');
      break;
    case 'Operational':
      steps.push('Select and launch 2-3 focused AI pilot use cases');
      steps.push('Establish clear success metrics and measurement frameworks');
      steps.push('Formalize governance and human oversight requirements');
      steps.push('Train team members on responsible AI use in their workflows');
      steps.push('Plan for scaling successful pilots across the organization');
      break;
    case 'Advanced':
      steps.push('Expand AI capabilities to more complex workflows');
      steps.push('Measure and report business impact of AI adoption');
      steps.push('Share best practices as a model for other HR functions');
      steps.push('Continuously refine governance to match evolving AI capabilities');
      steps.push('Evaluate emerging AI technologies and their applicability');
      break;
  }

  return steps;
}

// ─── Executive Summary ──────────────────────────────────────────────────────

function generateExecutiveSummary(draftScore: DraftScore): string {
  const { overall, categoryScores, riskOfInaction, answeredCount, totalCount } = draftScore;

  const completionNote = answeredCount < totalCount
    ? ` This assessment is based on ${answeredCount} of ${totalCount} questions answered (${Math.round((answeredCount / totalCount) * 100)}% completion).`
    : '';

  const sorted = [...categoryScores].sort((a, b) => b.normalizedScore - a.normalizedScore);
  const strongest = sorted.filter((c) => c.answeredCount > 0).slice(0, 2).map((c) => c.category);
  const weakest = sorted.filter((c) => c.answeredCount > 0).reverse().slice(0, 2).map((c) => c.category);

  // Best opportunity: high opportunity + at least some readiness
  const oppSorted = [...draftScore.opportunityScores].sort((a, b) => b.overallOpportunity - a.overallOpportunity);
  const topOpp = oppSorted.slice(0, 2).map((o) => o.category);

  let assessment = '';
  if (overall <= 25) {
    assessment = `The organization's overall HR AI Readiness Score is ${overall}/100, placing it in the Early Stage maturity band.${completionNote} Foundational capabilities across most HR functions are undeveloped or inconsistent. The risk of inaction is rated at ${riskOfInaction.overall}/100. Without immediate and focused investment in data readiness, process standardization, and governance, the organization will face growing competitive disadvantage and operational inefficiency.`;
  } else if (overall <= 50) {
    assessment = `The organization's overall HR AI Readiness Score is ${overall}/100, placing it in the Emerging maturity band.${completionNote} Some HR functions have begun building the foundations for AI adoption, but significant gaps remain in process consistency, data quality, and governance. The risk of inaction is rated at ${riskOfInaction.overall}/100. Targeted improvements in the weakest areas can yield measurable results within 90 days.`;
  } else if (overall <= 75) {
    assessment = `The organization's overall HR AI Readiness Score is ${overall}/100, placing it in the Operational maturity band.${completionNote} Most HR functions have established processes and data practices that can support AI adoption. The risk of inaction is rated at ${riskOfInaction.overall}/100. The organization is well positioned to launch focused pilots and begin scaling AI where readiness is strongest.`;
  } else {
    assessment = `The organization's overall HR AI Readiness Score is ${overall}/100, placing it in the Advanced maturity band.${completionNote} HR functions are mature, well governed, and ready for scaled AI adoption. The risk of inaction is rated at ${riskOfInaction.overall}/100. Focus should shift to expanding AI capabilities, measuring business impact, and maintaining governance standards.`;
  }

  if (strongest.length > 0) {
    assessment += ` Strongest functions: ${strongest.join(' and ')}.`;
  }
  if (weakest.length > 0) {
    assessment += ` Areas requiring the most attention: ${weakest.join(' and ')}.`;
  }
  if (topOpp.length > 0) {
    assessment += ` The greatest AI value creation opportunity exists in ${topOpp.join(' and ')}.`;
  }

  return assessment;
}

// ─── Prioritized Recommendations ────────────────────────────────────────────

function generateRecommendations(draftScore: DraftScore): string[] {
  const recs: string[] = [];
  const { categoryScores, opportunityScores } = draftScore;

  // Sort by combination of gap severity and opportunity
  const prioritized = CATEGORIES.map((cat) => {
    const cs = categoryScores.find((c) => c.category === cat)!;
    const os = opportunityScores.find((o) => o.category === cat)!;
    return {
      category: cat,
      gap: 100 - cs.normalizedScore,
      opportunity: os.overallOpportunity,
      priority: (100 - cs.normalizedScore) * 0.4 + os.overallOpportunity * 0.4 + os.valueCreation * 0.2,
    };
  }).sort((a, b) => b.priority - a.priority);

  for (const p of prioritized.slice(0, 5)) {
    const cs = categoryScores.find((c) => c.category === p.category)!;
    const os = opportunityScores.find((o) => o.category === p.category)!;

    if (cs.normalizedScore <= 25) {
      recs.push(`${p.category}: Build foundational capabilities immediately. Standardize workflows, improve data quality, and establish governance before attempting AI pilots. Readiness: ${cs.normalizedScore}/100, AI Opportunity: ${os.overallOpportunity}/100.`);
    } else if (cs.normalizedScore <= 50) {
      recs.push(`${p.category}: Close critical readiness gaps and prepare for targeted AI pilots. Focus on process standardization and data connectivity. Readiness: ${cs.normalizedScore}/100, AI Opportunity: ${os.overallOpportunity}/100.`);
    } else if (cs.normalizedScore <= 75) {
      recs.push(`${p.category}: Launch focused AI pilots in high-value use cases. Establish measurement frameworks and formalize governance. Readiness: ${cs.normalizedScore}/100, AI Opportunity: ${os.overallOpportunity}/100.`);
    } else {
      recs.push(`${p.category}: Scale AI adoption and optimize for business impact. Expand to more complex use cases and share best practices. Readiness: ${cs.normalizedScore}/100, AI Opportunity: ${os.overallOpportunity}/100.`);
    }
  }

  return recs;
}

// ─── 30-60-90 Day Roadmap ───────────────────────────────────────────────────

function generateRoadmap(draftScore: DraftScore): RoadmapPhase[] {
  const overall = draftScore.overall;
  const weakest = [...draftScore.categoryScores]
    .filter((c) => c.answeredCount > 0)
    .sort((a, b) => a.normalizedScore - b.normalizedScore)
    .slice(0, 3)
    .map((c) => c.category);

  const topOpp = [...draftScore.opportunityScores]
    .sort((a, b) => b.overallOpportunity - a.overallOpportunity)
    .slice(0, 3)
    .map((o) => o.category);

  const phase1: string[] = [
    'Share assessment results with HR leadership and key stakeholders',
    'Identify and assign an HR AI readiness owner or working group',
    `Prioritize foundational improvements in ${weakest[0] || 'the lowest-scoring function'}`,
    'Conduct a data quality and accessibility audit across HR systems',
    'Draft initial AI governance principles and human oversight requirements for HR',
    'Identify 2-3 high-value, low-risk AI pilot use cases',
  ];

  const phase2: string[] = [
    `Launch AI pilots in ${topOpp[0] || 'the highest-opportunity function'} with clear success metrics`,
    'Formalize AI governance framework with review controls and escalation paths',
    'Train HR leaders and managers on responsible AI use and oversight',
    'Improve data connectivity and workflow documentation in priority functions',
    'Establish a regular cadence for reviewing AI adoption progress and governance',
  ];

  const phase3: string[] = [];
  if (overall <= 50) {
    phase3.push('Evaluate pilot results and decide on continuation, expansion, or adjustment');
    phase3.push('Expand governance framework to cover additional HR functions');
    phase3.push('Begin scaling successful pilots across additional teams or locations');
    phase3.push('Develop a 12-month HR AI adoption roadmap with measurable milestones');
    phase3.push('Re-assess readiness using this diagnostic to measure progress against baseline');
  } else {
    phase3.push('Scale successful AI pilots across the organization');
    phase3.push('Measure and report business impact of AI adoption to executive leadership');
    phase3.push('Expand AI capabilities to more complex HR workflows');
    phase3.push('Formalize AI policies and integrate them into existing HR governance structures');
    phase3.push('Re-assess readiness using this diagnostic to measure progress and recalibrate priorities');
  }

  return [
    { label: 'First 30 Days', timeframe: 'Foundational actions', actions: phase1 },
    { label: 'Days 31-60', timeframe: 'Pilot and enablement', actions: phase2 },
    { label: 'Days 61-90', timeframe: 'Scale and governance', actions: phase3 },
  ];
}

// ─── Risk of Inaction Narrative ─────────────────────────────────────────────

function generateRiskNarrative(draftScore: DraftScore): string[] {
  const { riskOfInaction, overall } = draftScore;
  const blocks: string[] = [];

  if (overall <= 25) {
    blocks.push(`With an overall readiness score of ${overall}/100 and a risk of inaction score of ${riskOfInaction.overall}/100, the organization faces material operational and competitive risk. Every quarter that passes without addressing foundational HR readiness gaps compounds the cost of future AI adoption and widens the gap with organizations that are already modernizing HR operations.`);
  } else if (overall <= 50) {
    blocks.push(`The risk of inaction score of ${riskOfInaction.overall}/100 indicates meaningful exposure across multiple HR functions. While the organization has some foundations in place, the pace of AI adoption in HR is accelerating across industries. Organizations that delay readiness investments risk falling behind competitors, accumulating technical debt, and facing higher implementation costs when they eventually act.`);
  } else if (overall <= 75) {
    blocks.push(`The risk of inaction score of ${riskOfInaction.overall}/100 reflects moderate but real exposure. The organization has operational foundations, but gaps in specific functions represent missed efficiency gains and unrealized value. Competitors at similar maturity levels who invest in AI adoption now will gain a compounding advantage in HR productivity, employee experience, and decision quality.`);
  } else {
    blocks.push(`The risk of inaction score of ${riskOfInaction.overall}/100 is relatively low, reflecting strong overall readiness. The primary risk at this maturity level is complacency. Maintaining investment in governance, continuous improvement, and emerging AI capabilities is essential to sustain this competitive position.`);
  }

  // List top risk factors
  const topRisks = [...riskOfInaction.factors]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topRisks.length > 0) {
    blocks.push('The most significant risk factors identified in this assessment:');
    const riskList = topRisks.map((r) => `${r.label} (${r.score}/100)`).join('; ') + '.';
    blocks.push(riskList);
  }

  return blocks;
}

// ─── Immediate Next Steps ───────────────────────────────────────────────────

function generateNextSteps(draftScore: DraftScore): string[] {
  const steps: string[] = [];
  const { overall, answeredCount, totalCount, categoryScores } = draftScore;

  if (answeredCount < totalCount) {
    steps.push(`Complete the remaining ${totalCount - answeredCount} unanswered questions for a comprehensive assessment. Decisions based on partial data carry higher risk.`);
  }

  steps.push('Create an HR AI governance approach that defines principles, human oversight requirements, and acceptable use boundaries.');
  steps.push('Prioritize 2-3 pilot use cases based on the highest combination of readiness and opportunity from this assessment.');
  steps.push('Improve data and workflow readiness in the lowest-scoring functions before attempting AI adoption.');
  steps.push('Align stakeholders — including CHRO, legal, IT, and functional HR leaders — on AI adoption priorities and governance.');
  steps.push('Train HR leaders and managers on responsible AI use, including when human judgment must take precedence.');
  steps.push('Define policies and human review controls for AI-supported outputs in sensitive HR processes.');

  const weakest = [...categoryScores]
    .filter((c) => c.answeredCount > 0)
    .sort((a, b) => a.normalizedScore - b.normalizedScore)[0];

  if (weakest && weakest.normalizedScore < 50) {
    steps.push(`Address ${weakest.category} (${weakest.normalizedScore}/100) as an immediate priority — it represents the greatest drag on overall HR AI readiness.`);
  }

  if (overall < 50) {
    steps.push('Schedule a follow-up assessment in 60 days to measure progress against this baseline.');
  } else {
    steps.push('Schedule a follow-up assessment in 90 days to measure progress and recalibrate priorities.');
  }

  return steps;
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function generateImplications(
  state: AssessmentState,
  draftScore: DraftScore
): ImplicationsResult {
  const executiveSummary = generateExecutiveSummary(draftScore);

  const categoryImplications: CategoryImplication[] = CATEGORIES.map((cat) => {
    const cs = draftScore.categoryScores.find((c) => c.category === cat)!;
    return {
      category: cat,
      description: CATEGORY_DESCRIPTIONS[cat],
      score: cs.normalizedScore,
      band: cs.maturityBand,
      narrative: getCategoryNarrative(cat, cs.normalizedScore, cs.maturityBand),
      strengths: getCategoryStrengths(cat, state),
      barriers: getCategoryBarriers(cat, state),
      aiOpportunity: getCategoryAIOpportunity(cat, cs.normalizedScore),
      riskCommentary: getCategoryRiskCommentary(cat, cs.normalizedScore),
      nextSteps: getCategoryNextSteps(cat, cs.normalizedScore, cs.maturityBand),
    };
  });

  const prioritizedRecommendations = generateRecommendations(draftScore);
  const roadmap = generateRoadmap(draftScore);
  const riskOfInactionNarrative = generateRiskNarrative(draftScore);
  const immediateNextSteps = generateNextSteps(draftScore);

  return {
    executiveSummary,
    categoryImplications,
    prioritizedRecommendations,
    roadmap,
    riskOfInactionNarrative,
    immediateNextSteps,
  };
}
