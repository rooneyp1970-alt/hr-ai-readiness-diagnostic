'use client';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  size?: 'sm' | 'md';
  color?: string;
}

export default function ProgressBar({
  value,
  label,
  size = 'md',
  color = 'bg-shore-teal',
}: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">{label}</span>
          <span className="text-xs font-semibold text-shore-navy">{value}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
