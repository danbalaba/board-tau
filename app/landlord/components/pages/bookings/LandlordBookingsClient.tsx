'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  IconSearch,
  IconLoader2
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from "@/components/common/Button";
import { cn } from '@/utils/helper';
import ModernSearchInput from '@/components/common/ModernSearchInput';
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
  const [allBookings, setAllBookings] = useState(bookings.bookings);
  const [filteredBookings, setFilteredBookings] = useState(bookings.bookings);
  const [nextCursor, setNextCursor] = useState(bookings.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state with props
  useEffect(() => {
    setAllBookings(bookings.bookings);
    setFilteredBookings(bookings.bookings);
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

  const displayedBookings = useMemo(() => {
    let result = [...filteredBookings];
    
    if (selectedStatus !== 'all' || selectedPaymentStatus !== 'all') {
      result = result.filter(booking => {
        const statusMatch = selectedStatus === 'all' || booking.status?.toLowerCase() === selectedStatus.toLowerCase();
        const paymentMatch = selectedPaymentStatus === 'all' || booking.paymentStatus?.toLowerCase() === selectedPaymentStatus.toLowerCase();
        return statusMatch && paymentMatch;
      });
    }

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
  }, [selectedStatus, selectedPaymentStatus, filteredBookings, sortBy]);

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
        setAllBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ));
        setFilteredBookings(prev => prev.map(booking => 
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
        setAllBookings(prev => [...prev, ...data.data.bookings]);
        setFilteredBookings(prev => [...prev, ...data.data.bookings]);
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 md:p-5 rounded-2xl border border-primary/10 shadow-sm"
      >
        {/* Abstract background elements - Contained for dropdown visibility */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
              <IconCalendarCheck size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Bookings
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Confirmed reservations
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Optimized Search Bar */}
            <div className="w-full lg:w-72">
              <ModernSearchInput
                data={allBookings}
                searchKeys={['listing.title', 'user.name', 'user.email']}
                onSearch={setFilteredBookings}
                placeholder="Search bookings..."
                onSuggestionClick={(booking) => {
                  router.push(`/landlord/bookings/${booking.id}`);
                }}
                renderSuggestion={(booking) => (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {booking.listing.imageSrc ? (
                        <img src={booking.listing.imageSrc} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <IconCalendarCheck size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{booking.user.name || 'Anonymous'}</p>
                      <p className="text-[9px] font-bold text-primary tracking-widest uppercase truncate">{booking.listing.title}</p>
                    </div>
                  </div>
                )}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                {[
                  { value: 'newest', label: 'Recent', icon: IconHistory },
                  { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
                  { value: 'price_desc', label: 'High', icon: IconSortDescending },
                  { value: 'price_asc', label: 'Low', icon: IconSortAscending },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                        isSelected
                          ? "bg-primary text-white shadow-md shadow-primary/30"
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
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                    <IconFilter size={12} />
                    <span>Filters</span> {(selectedStatus !== 'all' || selectedPaymentStatus !== 'all') && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                  <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Booking Status</div>
                  <DropdownMenuGroup>
                    {statusOptions.map((option) => {
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
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Status</div>
                  <DropdownMenuGroup>
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSelectedPaymentStatus(option.value)}
                          className={cn(
                            "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                            selectedPaymentStatus === option.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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

              <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 text-gray-400 hover:text-gray-900",
                    viewMode === 'grid' && "bg-primary text-white shadow-md"
                  )}
                  title="Grid View"
                >
                  <IconLayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 text-gray-400 hover:text-gray-900",
                    viewMode === 'list' && "bg-primary text-white shadow-md"
                  )}
                  title="List View"
                >
                  <IconList size={16} />
                </button>
              </div>
            </div>

            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
            />
          </div>
        </div>
      </motion.div>

      {/* Mobile Filters */}
      <div className="lg:hidden flex flex-col gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm mb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Booking Status</span>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedStatus === status ? "bg-primary text-white" : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Payment Status</span>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedPaymentStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedPaymentStatus === status ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
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
          {displayedBookings.map((booking: any) => (
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

      {/* Enhanced Pagination / Load More */}
      <AnimatePresence>
        {nextCursor && allBookings.length >= 16 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center pt-16 pb-12 relative"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={cn(
                "group relative overflow-hidden rounded-2xl transition-all duration-500",
                isLoadingMore 
                  ? "cursor-default bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-12 py-5"
                  : "bg-white dark:bg-gray-900 border border-primary/20 hover:border-primary/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 px-10 py-4 active:scale-95"
              )}
            >
              {/* Animated Accent Bar */}
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                animate={isLoadingMore ? { 
                  width: ["0%", "100%", "0%"],
                  left: ["0%", "0%", "100%"]
                } : { width: 0 }}
                transition={isLoadingMore ? { 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              />

              <div className="relative flex flex-col items-center gap-3">
                {isLoadingMore ? (
                  <>
                    <div className="flex items-center gap-3 text-primary">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <IconLoader2 size={14} />
                      </motion.div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        Discovering more bookings
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 h-1 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 h-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      Explore More Bookings
                    </span>
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <IconChevronDown className="group-hover:translate-y-0.5 transition-transform" size={14} />
                    </div>
                  </div>
                )}
              </div>
            </button>

            {!isLoadingMore && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Showing {allBookings.length} bookings
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
