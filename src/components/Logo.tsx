'use client';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { svg: 32, text: 'text-sm', sub: 'text-[10px]' },
    md: { svg: 48, text: 'text-lg', sub: 'text-xs' },
    lg: { svg: 64, text: 'text-2xl', sub: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Waves behind the arrow */}
        <path
          d="M5 52 Q20 42 35 52 Q50 62 65 52 Q80 42 95 49"
          stroke="#B7DDD6"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M5 62 Q20 52 35 62 Q50 72 65 62 Q80 52 95 59"
          stroke="#6DB7AE"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        {/* Angled compass arrow */}
        <g transform="rotate(35, 50, 50)">
          <path d="M50 8 L62 50 L50 43 L38 50 Z" fill="#0D2238" />
          <path d="M50 92 L62 50 L50 57 L38 50 Z" fill="#41576A" />
        </g>
      </svg>
      <div>
        <span className={`font-bold text-shore-navy ${s.text} leading-tight block`}>
          Shore GTM
        </span>
        {size !== 'sm' && (
          <span className={`text-shore-slate leading-tight block ${s.sub}`}>
            HR AI Readiness Diagnostic
          </span>
        )}
      </div>
    </div>
  );
}
