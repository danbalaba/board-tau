'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconCalendarCheck, 
  IconCheck, 
  IconX, 
  IconChevronDown,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCreditCard,
  IconInbox,
  IconAlertCircle,
  IconLayoutGrid,
  IconList,
  IconSortAscending,
  IconSortDescending,
  IconHistory,
  IconCalendarEvent,
  IconFilter
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/lib/utils';
import { generateTablePDF } from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

import LandlordBookingCard from './components/bookings-card';

interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
}

interface LandlordBookingsFeatureProps {
  bookings: {
    bookings: Booking[];
    nextCursor: string | null;
  };
}

export default function LandlordBookingsFeature({ bookings }: LandlordBookingsFeatureProps) {
  const router = useRouter();
  const [listings, setListings] = useState(bookings.bookings);
  const [nextCursor, setNextCursor] = useState(bookings.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    setListings(bookings.bookings);
    setNextCursor(bookings.nextCursor);
  }, [bookings]);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    paid: 'bg-green-500/10 text-green-600 border-green-500/20',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const filteredBookings = useMemo(() => {
    let result = listings.filter(b => {
      const statusMatch = selectedStatus === 'all' || b.status?.toLowerCase() === selectedStatus.toLowerCase();
      const paymentMatch = selectedPaymentStatus === 'all' || b.paymentStatus?.toLowerCase() === selectedPaymentStatus.toLowerCase();
      return statusMatch && paymentMatch;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc':
          return a.totalPrice - b.totalPrice;
        case 'price_desc':
          return b.totalPrice - a.totalPrice;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [selectedStatus, selectedPaymentStatus, listings, sortBy]);

  const handleUpdateStatus = useCallback(async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setListings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  }, [router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/bookings?cursor=${nextCursor}`);
      const data = await response.json();
      if (data.success && data.data) {
        setListings(prev => [...prev, ...data.data.bookings]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Guest', 'Status', 'Payment', 'Total Price', 'Dates'];
    const data = filteredBookings.map((b: any) => [
      b.listing.title,
      b.user.name || b.user.email,
      b.status.toUpperCase(),
      b.paymentStatus.toUpperCase(),
      `PHP ${b.totalPrice.toLocaleString()}`,
      `${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
    ]);
    await generateTablePDF('Bookings_Report', columns, data, {
      title: 'Property Bookings Report',
      subtitle: `Overview of ${filteredBookings.length} bookings`,
      author: 'Landlord Dashboard'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300"><IconCalendarCheck size={22} /></div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">Bookings</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage your property bookings and payments</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconHistory },
                { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
                { value: 'price_desc', label: 'High Price', icon: IconSortDescending },
                { value: 'price_asc', label: 'Low Price', icon: IconSortAscending },
              ].map((o) => {
                const Icon = o.icon; const isSelected = sortBy === o.value;
                return (
                  <button key={o.value} onClick={() => setSortBy(o.value)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300", isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700")}>
                    <Icon size={12} /><span className="hidden sm:inline">{o.label}</span>
                  </button>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />Filters {((selectedStatus !== 'all') || (selectedPaymentStatus !== 'all')) && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {[{ value: 'all', label: 'All', icon: IconInbox }, { value: 'pending', label: 'Pending', icon: IconClock }, { value: 'confirmed', label: 'Confirmed', icon: IconCircleCheck }, { value: 'cancelled', label: 'Cancelled', icon: IconCircleX }].map((opt: any) => {
                    const Icon = opt.icon;
                    return (
                      <DropdownMenuItem key={opt.value} onClick={() => setSelectedStatus(opt.value)} className={cn("cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all", selectedStatus === opt.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>
                        <Icon size={14} />{opt.label}{selectedStatus === opt.value && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Payment</div>
                <DropdownMenuGroup>
                  {[{ value: 'all', label: 'All', icon: IconInbox }, { value: 'pending', label: 'Pending', icon: IconClock }, { value: 'paid', label: 'Paid', icon: IconCreditCard }, { value: 'failed', label: 'Failed', icon: IconAlertCircle }].map((opt: any) => {
                    const Icon = opt.icon;
                    return (
                      <DropdownMenuItem key={opt.value} onClick={() => setSelectedPaymentStatus(opt.value)} className={cn("cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all", selectedPaymentStatus === opt.value ? "bg-blue-500/10 text-blue-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>
                        <Icon size={14} />{opt.label}{selectedPaymentStatus === opt.value && <IconCheck size={14} className="ml-auto" />}
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

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary"><IconCalendarCheck size={24} /></div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No bookings found</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">No bookings match criteria.</p>
        </div>
      ) : (
        <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
          {filteredBookings.map((booking) => (
            <LandlordBookingCard 
              key={booking.id} 
              booking={booking} 
              viewMode={viewMode}
              statusColors={statusColors}
              paymentStatusColors={paymentStatusColors}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={(id) => router.push(`/landlord/bookings/${id}`)}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button outline className="rounded-xl px-10 py-4 group transition-all" onClick={handleLoadMore} isLoading={isLoadingMore}>
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">{isLoadingMore ? 'Fetching...' : 'Load More Bookings'}<IconChevronDown size={10} /></span>
          </Button>
        </div>
      )}
    </div>
  );
}
