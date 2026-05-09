import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Eye, Clock, MapPin, User, CheckCircle, AlertCircle, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';

const statusColors: Record<string, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  FAILED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  UNPAID: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const statusLabels: Record<string, string> = {
  PAID: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  UNPAID: 'Unpaid'
};

const statusIcons: Record<string, any> = {
  PAID: CheckCircle,
  PENDING: Clock3,
  FAILED: AlertCircle,
  UNPAID: AlertCircle
};

interface AdminTransactionCardProps {
  transaction: any;
  idx: number;
  viewMode: 'grid' | 'list';
}

export function AdminTransactionCard({
  transaction,
  idx,
  viewMode
}: AdminTransactionCardProps) {
  const tColor = statusColors[transaction.paymentStatus] || statusColors.UNPAID;
  const StatusIcon = statusIcons[transaction.paymentStatus] || AlertCircle;
  const tLabel = statusLabels[transaction.paymentStatus] || transaction.paymentStatus;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-blue-500/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
          <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-black font-mono text-gray-900 dark:text-white truncate">
              {transaction.id.slice(0, 8).toUpperCase()}
            </h3>
            <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1", tColor)}>
              <StatusIcon size={10} /> {tLabel}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 truncate flex items-center gap-1">
            <User size={12} /> {transaction.user?.name || 'Unknown User'}
          </p>
        </div>

        <div className="hidden md:block text-right shrink-0 px-4 max-w-[180px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Asset Reference</p>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
            {transaction.listing?.title || 'System Asset'}
          </p>
        </div>

        <div className="hidden lg:block text-right shrink-0 px-4 border-l border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Timestamp</p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-end gap-1">
            <Clock size={12} /> {format(new Date(transaction.createdAt), 'MMM d, HH:mm')}
          </p>
        </div>

        <div className="text-right shrink-0 pl-4 border-l border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Volume</p>
          <p className="text-sm font-black text-gray-900 dark:text-white font-mono">
            ${transaction.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <Button
          onClick={() => console.log('Inspect', transaction.id)}
          className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-500 transition-all ml-2"
        >
          <Eye size={20} />
        </Button>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20 transition-all duration-500 flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative flex justify-between p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        
        <span className="relative z-10 text-[10px] font-black font-mono uppercase tracking-widest text-gray-500 bg-white/80 dark:bg-gray-900/80 px-3 py-1.5 rounded-xl h-fit shadow-sm backdrop-blur-md">
          {transaction.id.slice(0, 8).toUpperCase()}
        </span>

        <span className={cn("relative z-10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md h-fit", tColor)}>
          {tLabel}
        </span>
      </div>

      <div className="px-6 relative -mt-10 mb-2">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 flex items-center justify-center text-gray-400">
          <CreditCard size={32} />
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        <h3 className="text-3xl font-black font-mono text-gray-900 dark:text-white leading-tight mb-2">
          ${transaction.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 space-y-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Initiator Profile</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate">
              <User size={14} /> {transaction.user?.name || 'Unknown User'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Asset Reference</p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate flex items-center gap-1.5">
              <MapPin size={14} /> {transaction.listing?.title || 'System Asset'}
            </p>
          </div>
        </div>

        <div className="mt-auto mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex justify-between items-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Timestamp</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Clock size={12} /> {format(new Date(transaction.createdAt), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mb-6 py-6 h-auto rounded-[1.25rem] hover:bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all group/btn"
        >
          <Eye size={16} className="mr-2 group-hover/btn:text-white" /> 
          <span className="group-hover/btn:text-white">Inspect Receipt</span>
        </Button>
      </div>
    </motion.div>
  );
}
