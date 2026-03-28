'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconCalendar, 
  IconEye, 
  IconCheck, 
  IconX, 
  IconClock,
  IconInbox,
  IconCircleCheck,
  IconCircleX,
  IconLayoutGrid,
  IconList,
  IconHistory,
  IconCalendarEvent,
  IconFilter
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/utils/helper';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

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
  moveInDate: Date;
  stayDuration: number;
  createdAt: Date;
}

interface LandlordReservationsClientProps {
  reservations: ReservationRequest[];
}

export default function LandlordReservationsClient({ reservations }: LandlordReservationsClientProps) {
  const { success, error: toastError } = useResponsiveToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
  };

  const router = useRouter();

  const formatStatus = useCallback((status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

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

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Requests', icon: IconInbox },
    { value: 'pending', label: 'Pending', icon: IconClock },
    { value: 'approved', label: 'Approved', icon: IconCircleCheck },
    { value: 'rejected', label: 'Rejected', icon: IconCircleX },
  ], []);

  const handleRespond = useCallback(async (inquiryId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/inquiries?id=${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the inquiries list
        router.refresh();
        success(`Reservation has been ${status}.`);
      } else {
        toastError(`Failed to ${status} reservation.`);
      }
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      toastError('An unexpected error occurred while processing the response.');
    }
  }, [router, success, toastError]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <IconCalendar size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Reservation Requests
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage reservation requests from potential tenants
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Sorting */}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconHistory },
                { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optimized Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />
                  Filters {selectedStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {statusOptions.map((option: any) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedStatus === option.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={14} />
                        {option.label}
                        {selectedStatus === option.value && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
                title="List View"
              >
                <IconList size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <IconCalendar size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No reservation requests found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            You haven't received any reservation requests matching the current criteria.
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredReservations.map((reservation) => (
            viewMode === 'grid' ? (
              <div
                key={reservation.id}
                className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm flex flex-col"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
                  {reservation.listing.imageSrc ? (
                    <img
                      src={reservation.listing.imageSrc}
                      alt={reservation.listing.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <IconCalendar size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", statusColors[reservation.status])}>
                      {reservation.status}
                    </span>
                    {reservation.paymentStatus && (
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", paymentStatusColors[reservation.paymentStatus])}>
                        {reservation.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-1">
                    {reservation.listing.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black ring-4 ring-white dark:ring-gray-800">
                      {reservation.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{reservation.user.name || 'Anonymous'}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{reservation.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Move In</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <IconCalendar size={12} className="text-primary" />
                        {new Date(reservation.moveInDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Duration</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <IconClock size={12} className="text-primary" />
                        {reservation.stayDuration} days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    outline
                    onClick={() => router.push(`/landlord/reservations/${reservation.id}`)}
                    className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    Manage Request
                  </Button>
                  
                  {reservation.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleRespond(reservation.id, 'approved')}
                        className="rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      >
                        Approve
                      </Button>
                      <Button
                        outline
                        onClick={() => handleRespond(reservation.id, 'rejected')}
                        className="rounded-xl py-2.5 border-red-200 text-red-500"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
              key={reservation.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                    {reservation.listing.imageSrc ? (
                      <img
                        src={reservation.listing.imageSrc}
                        alt={reservation.listing.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <IconCalendar size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[reservation.status])}>
                        {reservation.status}
                      </span>
                      {reservation.paymentStatus && (
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", paymentStatusColors[reservation.paymentStatus])}>
                          {reservation.paymentStatus}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {reservation.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                        {reservation.user.name?.charAt(0) || 'U'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{reservation.user.name || 'Anonymous User'}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                      {reservation.room && (
                        <span className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md uppercase tracking-wider text-[10px]">Room</span>
                          {reservation.room.name} • ₱{reservation.room.price.toLocaleString()}/mo
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <IconCalendar size={10} className="text-primary" />
                        {new Date(reservation.moveInDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <IconClock size={10} className="text-primary" />
                        {reservation.stayDuration} days
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Received {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/reservations/${reservation.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <IconEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {reservation.status === 'pending' && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => handleRespond(reservation.id, 'approved')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <IconCheck size={12} />
                        Approve
                      </span>
                    </Button>
                    <Button
                      outline
                      onClick={() => handleRespond(reservation.id, 'rejected')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900/50"
                    >
                      <span className="flex items-center gap-2">
                        <IconX size={12} />
                        Reject
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
