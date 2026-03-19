'use client';

import { CategoryScore } from '../lib/types';

interface RadarChartProps {
  categoryScores: CategoryScore[];
  size?: number;
}

export default function RadarChart({ categoryScores, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = categoryScores.length;
  if (n === 0) return null;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // start at top

  // Grid rings
  const rings = [25, 50, 75, 100];

  // Short labels
  const shortLabels: Record<string, string> = {
    'Talent Acquisition': 'Talent Acq.',
    'Onboarding': 'Onboarding',
    'Payroll': 'Payroll',
    'Benefits': 'Benefits',
    'Learning and Development': 'L&D',
    'Performance Management': 'Perf. Mgmt.',
    'Employee Relations and Compliance': 'ER & Comp.',
    'HR Operations and Workforce Analytics': 'HR Ops',
  };

  function polarToCart(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Data polygon
  const dataPoints = categoryScores.map((cs, i) => {
    const angle = startAngle + i * angleStep;
    const r = (cs.normalizedScore / 100) * radius;
    return polarToCart(angle, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid rings */}
      {rings.map((ring) => {
        const r = (ring / 100) * radius;
        const points = Array.from({ length: n }, (_, i) => {
          const angle = startAngle + i * angleStep;
          return polarToCart(angle, r);
        });
        const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';
        return (
          <g key={ring}>
            <path d={path} fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            <text
              x={cx + 4}
              y={cy - (ring / 100) * radius + 3}
              fontSize="8"
              fill="#9CA3AF"
            >
              {ring}
            </text>
          </g>
        );
      })}

      {/* Axis lines */}
      {categoryScores.map((_, i) => {
        const angle = startAngle + i * angleStep;
        const [ex, ey] = polarToCart(angle, radius);
        return (
          <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#E5E7EB" strokeWidth="0.5" />
        );
      })}

      {/* Data area */}
      <path d={dataPath} fill="#6DB7AE" fillOpacity="0.2" stroke="#6DB7AE" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#6DB7AE" stroke="#fff" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {categoryScores.map((cs, i) => {
        const angle = startAngle + i * angleStep;
        const labelR = radius + 24;
        const [lx, ly] = polarToCart(angle, labelR);
        const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
        return (
          <text
            key={cs.category}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9"
            fill="#0D2238"
            fontWeight="500"
          >
            {shortLabels[cs.category] || cs.category}
          </text>
        );
      })}
    </svg>
  );
}
