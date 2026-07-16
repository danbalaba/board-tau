import type { ActionId, ActionImpl } from 'kbar';
import * as React from 'react';
import { motion } from 'framer-motion';
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
          "group mx-3 my-1 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between relative overflow-hidden",
          active 
            ? "bg-primary/10 text-primary border-primary/20 shadow-sm z-10" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        )}
      >
        {active && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(47,125,109,0.5)]"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
          />
        )}
        <div className="flex items-center gap-4 relative z-10 w-full ml-1">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
            active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/25" : "bg-gray-100 dark:bg-gray-900 group-hover:bg-primary/10"
          )}>
            {action.icon}
          </div>
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-2 truncate leading-none mb-1">
              {ancestors.length > 0 && ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span className="text-[13px] font-bold tracking-tight truncate text-gray-500">
                    {ancestor.name}
                  </span>
                  <span className="text-gray-400">›</span>
                </React.Fragment>
              ))}
              <span className={cn(
                "text-[13px] font-bold tracking-tight truncate",
                active ? "text-primary" : "text-gray-900 dark:text-white"
              )}>
                {action.name}
              </span>
              {action.section && !active && (
                <Badge variant="outline" className="text-[9px] px-1.5 h-4 uppercase opacity-50 shrink-0 border-current">
                  {action.section as string}
                </Badge>
              )}
            </div>
            {action.subtitle && (
              <span className={cn(
                "text-[11px] font-medium truncate flex items-center gap-1.5 leading-none",
                active ? "text-primary/70" : "text-gray-500"
              )}>
                {action.subtitle}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <IconChevronRight 
              size={14} 
              className={cn(
                "transition-all duration-300 shrink-0",
                active ? "translate-x-0 text-primary opacity-100" : "-translate-x-2 text-gray-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
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
