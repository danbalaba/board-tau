import type { ActionId, ActionImpl } from 'kbar';
import * as React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: ActionId;
    },
    ref: React.Ref<HTMLDivElement>
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId
      );
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        className={cn(
          "group mx-3 my-1 px-4 py-3 rounded-2xl cursor-pointer border transition-all duration-150 ease-out flex items-center justify-between relative overflow-hidden",
          active 
            ? "bg-[#2f7d6d]/10 dark:bg-emerald-500/15 border-[#2f7d6d]/25 dark:border-emerald-500/30 text-slate-900 dark:text-white shadow-xs z-10" 
            : "border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
        )}
      >
        {/* Smooth Indicator Pill (fades & scales instead of abrupt mount/unmount) */}
        <div 
          className={cn(
            "absolute left-0.5 top-2.5 bottom-2.5 w-1 bg-[#2f7d6d] dark:bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(47,125,109,0.5)] transition-all duration-150 ease-out",
            active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
          )}
        />

        <div className="flex items-center gap-4 relative z-10 w-full ml-1">
          {/* Action Icon Box */}
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ease-out flex-shrink-0",
            active 
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/25 dark:bg-emerald-500 dark:text-slate-950 scale-[1.03]" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 scale-100"
          )}>
            {action.icon}
          </div>

          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-2 truncate leading-none mb-1">
              {ancestors.length > 0 && ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span className="text-xs font-bold tracking-tight truncate text-slate-500 dark:text-slate-400">
                    {ancestor.name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">›</span>
                </React.Fragment>
              ))}
              <span className={cn(
                "text-sm font-bold tracking-tight truncate transition-colors duration-150",
                active 
                  ? "text-[#2f7d6d] dark:text-emerald-300 font-extrabold" 
                  : "text-slate-900 dark:text-slate-100"
              )}>
                {action.name}
              </span>
              {action.section && !active && (
                <Badge variant="outline" className="text-[9px] px-2 py-0.5 uppercase tracking-widest shrink-0 font-bold border-[#2f7d6d]/30 bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400">
                  {action.section as string}
                </Badge>
              )}
            </div>
            {action.subtitle && (
              <span className={cn(
                "text-xs font-semibold truncate flex items-center gap-1.5 leading-tight mt-0.5 transition-colors duration-150",
                active 
                  ? "text-[#2f7d6d]/80 dark:text-emerald-400/80" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                {action.subtitle}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <IconChevronRight 
              size={16} 
              className={cn(
                "transition-all duration-150 ease-out shrink-0",
                active 
                  ? "translate-x-0 text-[#2f7d6d] dark:text-emerald-400 opacity-100" 
                  : "-translate-x-1.5 text-slate-400 dark:text-slate-500 opacity-0"
              )}
            />
          </div>
        </div>
      </div>
    );
  }
);

ResultItem.displayName = 'KBarResultItem';

export default ResultItem;
