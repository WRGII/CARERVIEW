// src/components/ui/ScorePicker.tsx
import React from "react";

type ScorePickerProps = {
  value?: number;
  onChange: (v: number | undefined) => void;
  descriptions?: Record<number, string>;
  ariaLabel?: string;
  disabled?: boolean;
};

const shades: Record<number, string> = {
  1: "bg-mint-green text-slate-800 border-mint-green",
  2: "bg-mint-green/70 text-slate-800 border-mint-green/70",
  3: "bg-cyan-primary/30 text-slate-800 border-cyan-primary/40",
  4: "bg-peach-blush/70 text-slate-800 border-peach-blush/70",
  5: "bg-peach-blush text-slate-800 border-peach-blush",
};

const outlines: Record<number, string> = {
  1: "border-mint-green/70 text-slate-500 hover:bg-mint-green/35 hover:border-mint-green hover:text-slate-700",
  2: "border-mint-green/50 text-slate-500 hover:bg-mint-green/25 hover:border-mint-green/80 hover:text-slate-700",
  3: "border-cyan-primary/40 text-slate-500 hover:bg-cyan-primary/15 hover:border-cyan-primary/60 hover:text-slate-700",
  4: "border-peach-blush/50 text-slate-500 hover:bg-peach-blush/20 hover:border-peach-blush/80 hover:text-slate-700",
  5: "border-peach-blush/60 text-slate-500 hover:bg-peach-blush/25 hover:border-peach-blush hover:text-slate-700",
};

export default function ScorePicker({
  value,
  onChange,
  descriptions,
  ariaLabel,
  disabled,
}: ScorePickerProps) {
  const set = (n: number) => {
    if (disabled) return;
    onChange(value === n ? undefined : n);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      onChange(undefined);
      return;
    }
    if (e.key === "Home") { e.preventDefault(); onChange(1); return; }
    if (e.key === "End") { e.preventDefault(); onChange(5); return; }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(value ? Math.max(1, value - 1) : 1);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(value ? Math.min(5, value + 1) : 1);
      return;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || "Score"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="flex gap-1.5 min-w-0"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        const title = descriptions?.[n] ? `${n} – ${descriptions[n]}` : `${n}`;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            title={title}
            disabled={disabled}
            onClick={() => set(n)}
            className={`
              w-11 h-11 rounded-full border-2 text-base font-bold
              transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
              focus:ring-cyan-primary/40 disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95
              ${active ? shades[n] + ' ring-2 ring-offset-1 ring-slate-400/30 shadow-sm' : outlines[n] + ' bg-white'}
            `}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
