import { KBarResults, useMatches } from 'kbar';
import ResultItem from './result-item';

export default function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-6 py-2 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
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
