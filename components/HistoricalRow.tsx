// components/HistoricalRow.tsx
import type { HistoricalMatch } from '@/lib/dagestan';

export default function HistoricalRow({ match }: { match: HistoricalMatch }) {
  const isWin = match.result === 'win';

  return (
    <tr className="border-b border-slate-800/80 text-xs sm:text-sm hover:bg-slate-800/30 transition-colors">
      <td className="py-2 pr-2 text-slate-400">
        {new Date(match.eventDate).toLocaleDateString()}
      </td>
      <td className="py-2 pr-2 text-slate-200">{match.eventName}</td>
      <td className="py-2 pr-2 text-slate-100">{match.fighterA}</td>
      <td className="py-2 pr-2 text-slate-100">{match.fighterB}</td>
      <td className="py-2 pr-2 text-emerald-300">{match.winner}</td>
      <td className="py-2 pr-2 text-slate-300">{match.method}</td>
      <td className="py-2 pr-2 text-slate-300">{match.round}</td>
      <td className="py-2 pr-2 text-slate-200">{match.dagestaniFighter}</td>
      <td className="py-2 pl-2">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isWin
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
              : 'bg-rose-500/10 text-rose-300 border border-rose-400/40'
          }`}
        >
          {isWin ? 'WIN' : 'LOSS'}
        </span>
      </td>
    </tr>
  );
}
