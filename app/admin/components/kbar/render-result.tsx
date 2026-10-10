import { KBarResults, useMatches } from 'kbar';
import ResultItem from './result-item';

export default function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      maxHeight={440}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-6 py-2.5 mt-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#2f7d6d] dark:text-emerald-400 flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-[#2f7d6d] dark:bg-emerald-400" />
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ''}
          />
        )
      }
    />
  );
}
