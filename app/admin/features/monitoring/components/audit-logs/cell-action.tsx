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
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
        <DropdownMenuItem 
          onClick={() => onViewDetails(data)}
          className="text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <FileJson className="mr-2 h-4 w-4 text-emerald-500" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
