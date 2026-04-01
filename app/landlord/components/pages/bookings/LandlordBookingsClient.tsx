'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconCalendarCheck,
  IconEye,
  IconCheck,
  IconX,
  IconCalendar,
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
  IconFilter,
  IconSearchOff
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/utils/helper';
import {
  generateTablePDF
} from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { ModernLoadMore } from '@/components/common/ModernLoadMore';
import { SectionSearch } from '@/components/common/SectionSearch';

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
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface LandlordBookingsClientProps {
  bookings: {
    bookings: Booking[];
    nextCursor: string | null;
  };
}

export default function LandlordBookingsClient({ bookings }: LandlordBookingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [listings, setListings] = useState(bookings.bookings);
  const [nextCursor, setNextCursor] = useState(bookings.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Sync state with props
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

  const formatStatus = useCallback((status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const filteredBookings = useMemo(() => {
    let result = listings.filter(booking => {
      const statusMatch = selectedStatus === 'all' || booking.status?.toLowerCase() === selectedStatus.toLowerCase();
      const paymentMatch = selectedPaymentStatus === 'all' || booking.paymentStatus?.toLowerCase() === selectedPaymentStatus.toLowerCase();

      let searchMatch = true;
      if (localSearchQuery) {
        const query = localSearchQuery.toLowerCase();
        searchMatch = booking.listing.title.toLowerCase().includes(query) ||
          (booking.user.name?.toLowerCase() || '').includes(query) ||
          booking.user.email.toLowerCase().includes(query);
      }

      return statusMatch && paymentMatch && searchMatch;
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
  }, [selectedStatus, selectedPaymentStatus, listings, sortBy, searchQuery]);

  const clearSearch = () => {
    router.push('/landlord/bookings');
  };

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All', icon: IconInbox },
    { value: 'pending', label: 'Pending', icon: IconClock },
    { value: 'confirmed', label: 'Confirmed', icon: IconCircleCheck },
    { value: 'cancelled', label: 'Cancelled', icon: IconCircleX },
  ], []);

  const paymentOptions = useMemo(() => [
    { value: 'all', label: 'All', icon: IconInbox },
    { value: 'pending', label: 'Pending', icon: IconClock },
    { value: 'paid', label: 'Paid', icon: IconCreditCard },
    { value: 'failed', label: 'Failed', icon: IconAlertCircle },
  ], []);

  const handleUpdateStatus = useCallback(async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setListings(prev => prev.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        ));
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
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
      console.error('Error loading more bookings:', error);
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

    await generateTablePDF(
      'Bookings_Report',
      columns,
      data,
      {
        title: 'Property Bookings Report',
        subtitle: `Overview of all ${filteredBookings.length} bookings matching current filters`,
        author: 'Landlord Dashboard'
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border border-primary/10 shadow-sm relative">
        {/* Background clipping wrapper */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <IconCalendarCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  Bookings
                </h1>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5 opacity-70">
                Manage your property bookings and payments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 lg:mt-0">
            <SectionSearch
              section="bookings"
              placeholder="Search bookings..."
              onSearchChange={setLocalSearchQuery}
              className="w-full lg:w-72"
            />
            {/* Sorting Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconHistory size={14} />
                  Sort By
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Order by</div>
                <DropdownMenuGroup>
                  {[
                    { value: 'newest', label: 'Newest first', icon: IconHistory },
                    { value: 'oldest', label: 'Oldest first', icon: IconCalendarEvent },
                    { value: 'price_desc', label: 'Price: High to Low', icon: IconSortDescending },
                    { value: 'price_asc', label: 'Price: Low to High', icon: IconSortAscending },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = sortBy === option.value;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          isSelected ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={14} />
                        {option.label}
                        {isSelected && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Optimized Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />
                  Filters {((selectedStatus !== 'all') || (selectedPaymentStatus !== 'all')) && <span className="w-2 h-2 rounded-full bg-primary" />}
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
                <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Payment</div>
                <DropdownMenuGroup>
                  {paymentOptions.map((option: any) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedPaymentStatus(option.value)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedPaymentStatus === option.value ? "bg-blue-500/10 text-blue-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={14} />
                        {option.label}
                        {selectedPaymentStatus === option.value && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
                title="List View"
              >
                <IconList size={16} />
              </button>
            </div>

            <GenerateReportButton
              onGeneratePDF={handleGenerateReport}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <IconCalendarCheck size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            You don't have any bookings matching the current criteria yet.
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredBookings.map((booking: any) => (
            viewMode === 'grid' ? (
              <div
                key={booking.id}
                className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm flex flex-col"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
                  {booking.listing.imageSrc ? (
                    <img
                      src={booking.listing.imageSrc}
                      alt={booking.listing.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <IconCalendarCheck size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", statusColors[booking.status])}>
                      {booking.status}
                    </span>
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", paymentStatusColors[booking.paymentStatus])}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {booking.listing.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black ring-2 ring-primary/5">
                        {booking.user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-gray-100">{booking.user.name || 'Anonymous'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">₱{booking.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-6 flex items-center gap-2">
                    <IconCalendar size={14} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    outline
                    onClick={() => router.push(`/landlord/bookings/${booking.id}`)}
                    className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    Manage Booking
                  </Button>

                  {booking.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        className="rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      >
                        Confirm
                      </Button>
                      <Button
                        outline
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="rounded-xl py-2.5 border-red-200 text-red-500"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={booking.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                  <div className="flex items-start gap-5 flex-1">
                    <div className="relative w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                      {booking.listing.imageSrc ? (
                        <img
                          src={booking.listing.imageSrc}
                          alt={booking.listing.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <IconCalendarCheck size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[booking.status])}>
                          {booking.status}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", paymentStatusColors[booking.paymentStatus])}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {booking.listing.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                          {booking.user.name?.charAt(0) || 'U'}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{booking.user.name || 'Anonymous User'}</span>
                        </p>
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white mb-2">
                        ₱{booking.totalPrice.toLocaleString()}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                          <IconCalendar size={10} className="text-primary" />
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    outline
                    onClick={() => router.push(`/landlord/bookings/${booking.id}`)}
                    className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      <IconEye size={12} />
                      View Details
                    </span>
                  </Button>

                  {booking.status === 'pending' && (
                    <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                      <Button
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      >
                        <span className="flex items-center gap-2">
                          <IconCheck size={12} />
                          Confirm
                        </span>
                      </Button>
                      <Button
                        outline
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900/50"
                      >
                        <span className="flex items-center gap-2">
                          <IconX size={12} />
                          Cancel
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

      <div className="mt-8 bg-white/20 dark:bg-gray-800/10 backdrop-blur-sm rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-2 shadow-lg shadow-gray-200/5 dark:shadow-none animate-in fade-in slide-in-from-bottom-6 duration-700">
        <ModernLoadMore
          onLoadMore={handleLoadMore}
          isLoading={isLoadingMore}
          hasMore={!!nextCursor}
          label="Browse More Bookings"
          loadingLabel="Confirming Schedules..."
        />
      </div>
    </div>
  );
}
