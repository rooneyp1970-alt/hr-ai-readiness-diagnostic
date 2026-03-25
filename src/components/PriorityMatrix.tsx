'use client';

import { CategoryScore, OpportunityScore, Category } from '../lib/types';

interface PriorityMatrixProps {
  categoryScores: CategoryScore[];
  opportunityScores: OpportunityScore[];
}

const DOT_COLORS: Record<string, string> = {
  'Talent Acquisition': '#6DB7AE',
  'Onboarding': '#3B82F6',
  'Payroll': '#8B5CF6',
  'Benefits': '#10B981',
  'Learning and Development': '#F59E0B',
  'Performance Management': '#F43F5E',
  'Employee Relations and Compliance': '#F97316',
  'HR Operations and Workforce Analytics': '#0D2238',
};

const SHORT_NAMES: Record<Category, string> = {
  'Talent Acquisition': 'TA',
  'Onboarding': 'ONB',
  'Payroll': 'PAY',
  'Benefits': 'BEN',
  'Learning and Development': 'L&D',
  'Performance Management': 'PM',
  'Employee Relations and Compliance': 'ER',
  'HR Operations and Workforce Analytics': 'OPS',
};

export default function PriorityMatrix({ categoryScores, opportunityScores }: PriorityMatrixProps) {
  const padding = 50;
  const w = 360;
  const h = 360;
  const plotW = w - padding * 2;
  const plotH = h - padding * 2;

  const points = categoryScores.map((cs) => {
    const opp = opportunityScores.find((o) => o.category === cs.category);
    return {
      category: cs.category,
      readiness: cs.normalizedScore,
      opportunity: opp?.overallOpportunity ?? 0,
    };
  });

  const scaleX = (v: number) => padding + (v / 100) * plotW;
  const scaleY = (v: number) => padding + plotH - (v / 100) * plotH;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Background quadrants */}
        <rect x={padding} y={padding} width={plotW / 2} height={plotH / 2} fill="#FEF3C7" opacity={0.3} />
        <rect x={padding + plotW / 2} y={padding} width={plotW / 2} height={plotH / 2} fill="#D1FAE5" opacity={0.3} />
        <rect x={padding} y={padding + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#FEE2E2" opacity={0.3} />
        <rect x={padding + plotW / 2} y={padding + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#DBEAFE" opacity={0.3} />

        {/* Quadrant labels */}
        <text x={padding + plotW * 0.25} y={padding + 14} textAnchor="middle" fontSize="8" fill="#92400E" fontWeight="500">Build &amp; Prepare</text>
        <text x={padding + plotW * 0.75} y={padding + 14} textAnchor="middle" fontSize="8" fill="#065F46" fontWeight="500">Scale &amp; Optimize</text>
        <text x={padding + plotW * 0.25} y={padding + plotH - 6} textAnchor="middle" fontSize="8" fill="#991B1B" fontWeight="500">Monitor</text>
        <text x={padding + plotW * 0.75} y={padding + plotH - 6} textAnchor="middle" fontSize="8" fill="#1E40AF" fontWeight="500">Quick Wins</text>

        {/* Axes */}
        <line x1={padding} y1={padding + plotH} x2={padding + plotW} y2={padding + plotH} stroke="#9CA3AF" strokeWidth={1} />
        <line x1={padding} y1={padding} x2={padding} y2={padding + plotH} stroke="#9CA3AF" strokeWidth={1} />

        {/* Grid lines */}
        {[25, 50, 75].map((v) => (
          <g key={v}>
            <line x1={scaleX(v)} y1={padding} x2={scaleX(v)} y2={padding + plotH} stroke="#E5E7EB" strokeWidth={0.5} strokeDasharray="4 2" />
            <line x1={padding} y1={scaleY(v)} x2={padding + plotW} y2={scaleY(v)} stroke="#E5E7EB" strokeWidth={0.5} strokeDasharray="4 2" />
          </g>
        ))}

        {/* Axis labels */}
        <text x={padding + plotW / 2} y={h - 8} textAnchor="middle" fontSize="9" fill="#41576A" fontWeight="600">Readiness Score →</text>
        <text x={12} y={padding + plotH / 2} textAnchor="middle" fontSize="9" fill="#41576A" fontWeight="600" transform={`rotate(-90, 12, ${padding + plotH / 2})`}>AI Opportunity →</text>

        {/* Tick labels */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <text x={scaleX(v)} y={padding + plotH + 14} textAnchor="middle" fontSize="7" fill="#9CA3AF">{v}</text>
            <text x={padding - 6} y={scaleY(v) + 3} textAnchor="end" fontSize="7" fill="#9CA3AF">{v}</text>
          </g>
        ))}

        {/* Data points */}
        {points.map((p) => (
          <g key={p.category}>
            <circle
              cx={scaleX(p.readiness)}
              cy={scaleY(p.opportunity)}
              r={10}
              fill={DOT_COLORS[p.category] ?? '#6DB7AE'}
              opacity={0.85}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={scaleX(p.readiness)}
              y={scaleY(p.opportunity) + 3}
              textAnchor="middle"
              fontSize="7"
              fill="white"
              fontWeight="700"
            >
              {SHORT_NAMES[p.category]}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 px-2">
        {points.map((p) => (
          <div key={p.category} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: DOT_COLORS[p.category] }}
            />
            <span className="text-[10px] text-gray-600 truncate">{p.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
