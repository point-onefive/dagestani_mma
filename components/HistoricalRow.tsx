// components/HistoricalRow.tsx
import type { HistoricalMatch } from '@/lib/dagestan';

interface HistoricalRowProps {
  match: HistoricalMatch;
  index: number;
}

export default function HistoricalRow({ match, index }: HistoricalRowProps) {
  const isWin = match.result === 'win';
  const isEven = index % 2 === 0;

  return (
    <tr className={`border-b border-purple-500/10 text-xs sm:text-sm hover:bg-purple-500/10 transition-colors ${
      isEven ? 'bg-black/20' : 'bg-black/40'
    }`}>
      <td className="py-2 px-2 sm:px-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isWin
              ? 'bg-green-500/15 text-green-300 border border-green-400/40'
              : 'bg-rose-500/10 text-rose-300 border border-rose-400/40'
          }`}
        >
          {isWin ? 'WIN' : 'LOSS'}
        </span>
      </td>
      <td className="py-2 px-2 sm:px-3 text-slate-200">{match.eventName}</td>
      <td className="py-2 px-2 sm:px-3 text-slate-400">
        {new Date(match.eventDate).toLocaleDateString()}
      </td>
      <td className="py-2 px-2 sm:px-3 text-slate-100">{match.fighterA}</td>
      <td className="py-2 px-2 sm:px-3 text-slate-100">{match.fighterB}</td>
      <td className="py-2 px-2 sm:px-3 text-purple-300">{match.winner}</td>
      <td className="py-2 px-2 sm:px-3 text-slate-300">{match.method}</td>
      <td className="py-2 px-2 sm:px-3 text-slate-300">{match.round}</td>
      <td className="py-2 px-2 sm:px-3 text-slate-200">{match.dagestaniFighter}</td>
    </tr>
  );
}
