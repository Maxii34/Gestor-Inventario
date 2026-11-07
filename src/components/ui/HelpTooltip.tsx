import { useId } from 'react';
import { LuCircleHelp } from 'react-icons/lu';

interface HelpTooltipProps {
  text: string;
}

export function HelpTooltip({ text }: HelpTooltipProps) {
  const tooltipId = useId();

  return (
    <span className="group relative hidden shrink-0 sm:inline-flex">
      <button
        type="button"
        aria-label={`Ayuda: ${text}`}
        aria-describedby={tooltipId}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
      >
        <LuCircleHelp aria-hidden="true" size={15} />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-52 max-w-[calc(100vw-2rem)] rounded-lg bg-zinc-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
