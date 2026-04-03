'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconCalendar, 
  IconCheck, 
  IconInbox, 
  IconCircleCheck, 
  IconCircleX, 
  IconLayoutGrid, 
  IconList, 
  IconHistory, 
  IconCalendarEvent, 
  IconFilter,
  IconClock
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/lib/utils';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

import LandlordReservationCard from './components/reservations-card';

interface ReservationRequest {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus?: string;
  moveInDate: Date | string;
  stayDuration: number;
  createdAt: Date | string;
}

interface LandlordReservationsFeatureProps {
  reservations: ReservationRequest[];
}

export default function LandlordReservationsFeature({ reservations }: LandlordReservationsFeatureProps) {
  const { success, error: toastError } = useResponsiveToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const router = useRouter();

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
  };

  const filteredReservations = useMemo(() => {
    let result = [...reservations];
    if (selectedStatus !== 'all') {
      result = result.filter(r => r.status?.toLowerCase() === selectedStatus.toLowerCase());
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [selectedStatus, reservations, sortBy]);

  const handleRespond = useCallback(async (inquiryId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/inquiries?id=${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        router.refresh();
        success(`Reservation has been ${status}.`);
      } else {
        toastError(`Failed to respond.`);
      }
    } catch (error) {
      toastError('An error occurred.');
    }
  }, [router, success, toastError]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Tenant', 'Status', 'Move In Date', 'Duration'];
    const data = filteredReservations.map((r: any) => [
      r.listing.title,
      r.user.name || r.user.email,
      r.status.toUpperCase(),
      new Date(r.moveInDate).toLocaleDateString(),
      `${r.stayDuration} days`
    ]);
    await generateTablePDF('Reservations_Report', columns, data, {
      title: 'Reservation Requests Report',
      subtitle: `Overview of ${filteredReservations.length} requests`,
      author: 'Landlord Dashboard'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300"><IconCalendar size={22} /></div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">Reservation Requests</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage reservation requests from potential tenants</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[{ value: 'newest', label: 'Newest', icon: IconHistory }, { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent }].map((o) => {
                const Icon = o.icon; const isSelected = sortBy === o.value;
                return (
                  <button key={o.value} onClick={() => setSortBy(o.value)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300", isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700")}>
                    <Icon size={12} /><span>{o.label}</span>
                  </button>
                );
              })}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />Filters {selectedStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {[
                    { value: 'all', label: 'All Requests', icon: IconInbox },
                    { value: 'pending', label: 'Pending', icon: IconClock },
                    { value: 'approved', label: 'Approved', icon: IconCircleCheck },
                    { value: 'rejected', label: 'Rejected', icon: IconCircleX },
                  ].map((opt: any) => {
                    const Icon = opt.icon;
                    return (
                      <DropdownMenuItem key={opt.value} onClick={() => setSelectedStatus(opt.value)} className={cn("cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all", selectedStatus === opt.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>
                        <Icon size={14} />{opt.label}{selectedStatus === opt.value && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all duration-300", viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white")} title="Grid View"><IconLayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all duration-300", viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white")} title="List View"><IconList size={18} /></button>
            </div>
            <GenerateReportButton onGeneratePDF={handleGenerateReport} />
          </div>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary"><IconCalendar size={24} /></div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No reservation requests found</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Criteria did not match any requests.</p>
        </div>
      ) : (
        <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
          {filteredReservations.map((reservation) => (
            <LandlordReservationCard 
              key={reservation.id} 
              reservation={reservation} 
              viewMode={viewMode}
              statusColors={statusColors}
              paymentStatusColors={paymentStatusColors}
              onRespond={handleRespond}
              onManage={(id) => router.push(`/landlord/reservations/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
