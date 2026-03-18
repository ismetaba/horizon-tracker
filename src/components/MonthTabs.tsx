'use client';

import { formatMonthLabel, formatTL } from '@/lib/store';

const accents = {
  blue: { active: 'bg-blue-600 text-white shadow-lg shadow-blue-500/25', inactive: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' },
  amber: { active: 'bg-amber-600 text-white shadow-lg shadow-amber-500/25', inactive: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' },
};

export default function MonthTabs({
  months,
  selected,
  onSelect,
  totals,
  accentColor = 'blue',
}: {
  months: string[];
  selected: string;
  onSelect: (month: string) => void;
  totals: Record<string, number>;
  accentColor?: 'blue' | 'amber';
}) {
  const colors = accents[accentColor];
  const allTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('')}
        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
          selected === '' ? colors.active : colors.inactive
        }`}
      >
        <span className="block">Tümü</span>
        <span className="block text-[10px] tabular-nums opacity-75">₺{formatTL(allTotal)}</span>
      </button>
      {months.map(m => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            selected === m ? colors.active : colors.inactive
          }`}
        >
          <span className="block">{formatMonthLabel(m)}</span>
          <span className="block text-[10px] tabular-nums opacity-75">₺{formatTL(totals[m] || 0)}</span>
        </button>
      ))}
    </div>
  );
}
