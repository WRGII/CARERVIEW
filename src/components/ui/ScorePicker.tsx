// src/components/ui/ScorePicker.tsx
import React from "react";

/**
 * Props
 * - value: current score (1..5) or undefined for "no selection"
 * - onChange: called with next value (1..5) or undefined to clear
 * - descriptions: optional map of score -> text used for title/tooltips
 * - ariaLabel: accessible label describing the question being scored
 * - disabled: disable interaction
 */
type ScorePickerProps = {
  value?: number;
  onChange: (v: number | undefined) => void;
  descriptions?: Record<number, string>;
  ariaLabel?: string;
  disabled?: boolean;
};

const shades: Record<number, string> = {
  1: "bg-red-500 text-white border-red-500",
  2: "bg-orange-500 text-white border-orange-500",
  3: "bg-yellow-400 text-slate-900 border-yellow-400",
  4: "bg-lime-500 text-slate-900 border-lime-500",
  5: "bg-green-500 text-white border-green-500",
};

const outlines: Record<number, string> = {
  1: "border-red-400 text-red-700 hover:bg-red-50",
  2: "border-orange-400 text-orange-700 hover:bg-orange-50",
  3: "border-yellow-400 text-yellow-700 hover:bg-yellow-50",
  4: "border-lime-400 text-lime-700 hover:bg-lime-50",
  5: "border-green-400 text-green-700 hover:bg-green-50",
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
    onChange(value === n ? undefined : n); // tap again to clear
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      onChange(undefined);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      onChange(5);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = value ? Math.max(1, value - 1) : 1;
      onChange(next);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = value ? Math.min(5, value + 1) : 1;
      onChange(next);
      return;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || "Score"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        const base =
          "inline-flex items-center justify-center w-9 h-9 rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50";
        const cls = active ? shades[n] : outlines[n];
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
            className={`${base} ${cls}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
