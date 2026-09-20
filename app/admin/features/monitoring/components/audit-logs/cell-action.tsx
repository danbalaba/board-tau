'use client';

import { MoreHorizontal, FileJson } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/admin/components/ui/dropdown-menu';
import { AuditLog } from './columns';

interface CellActionProps {
  data: AuditLog;
  onViewDetails: (log: AuditLog) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onViewDetails }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary focus:bg-primary/10 text-gray-400 dark:text-gray-500 cursor-pointer transition-colors"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl w-44">
        <DropdownMenuItem 
          onClick={() => onViewDetails(data)}
          className="text-xs font-extrabold py-2 px-3 rounded-xl cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors flex items-center"
        >
          <FileJson className="mr-2 h-4 w-4 text-primary shrink-0" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
