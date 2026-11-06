import { LuBoxes } from 'react-icons/lu';

interface BrandLockupProps {
  subtitle?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export function BrandLockup({
  subtitle,
  variant = 'light',
  size = 'md',
}: BrandLockupProps) {
  const isDark = variant === 'dark';
  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-950/20 ${
          isSmall ? 'h-9 w-9' : 'h-11 w-11'
        }`}
      >
        <LuBoxes size={isSmall ? 18 : 21} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p
          className={`whitespace-nowrap font-semibold tracking-tight ${
            isSmall ? 'text-[15px]' : 'text-base'
          } ${isDark ? 'text-white' : 'text-zinc-950'}`}
        >
          Stock<span className={isDark ? 'text-cyan-300' : 'text-indigo-600'}>Next</span>
        </p>
        {subtitle && (
          <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
