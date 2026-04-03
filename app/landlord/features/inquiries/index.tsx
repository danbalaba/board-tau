'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconMail,
  IconCheck,
  IconX,
  IconChevronDown,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconInbox,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconCalendarEvent,
  IconSearch,
  IconHistory,
  IconAlertTriangle
} from '@tabler/icons-react';
import Button from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateTablePDF } from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

import LandlordInquiryCard from './components/inquiries-card';
import LandlordInquiryDetailModal from './components/inquiries-detail-modal';

interface Inquiry {
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
  room?: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  createdAt: string | Date;
}

interface LandlordInquiriesFeatureProps {
  inquiries: {
    inquiries: Inquiry[];
    nextCursor: string | null;
  };
}

export default function LandlordInquiriesFeature({ inquiries }: LandlordInquiriesFeatureProps) {
  const router = useRouter();
  const [listings, setListings] = useState(inquiries.inquiries);
  const [nextCursor, setNextCursor] = useState(inquiries.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setListings(inquiries.inquiries);
    setNextCursor(inquiries.nextCursor);
  }, [inquiries]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const statusIcons: Record<string, any> = {
    PENDING: IconClock,
    APPROVED: IconCircleCheck,
    REJECTED: IconCircleX,
  };

  const filteredInquiries = useMemo(() => {
    let result = [...listings];
    if (selectedStatus !== "ALL") {
      result = result.filter((i) => i.status === selectedStatus);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) =>
        i.listing.title.toLowerCase().includes(query) ||
        (i.user.name?.toLowerCase() || '').includes(query) ||
        i.user.email.toLowerCase().includes(query)
      );
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
  }, [selectedStatus, listings, searchQuery, sortBy]);

  const handleRespond = useCallback(
    async (inquiryId: string, status: "APPROVED" | "REJECTED") => {
      const loadingToast = toast.loading(`Marking inquiry as ${status.toLowerCase()}...`);
      try {
        const response = await fetch(`/api/landlord/inquiries?id=${inquiryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (response.ok) {
          setListings((prev) =>
            prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
          );
          router.refresh();
          toast.success(`Inquiry has been ${status.toLowerCase()}.`, { id: loadingToast });
        } else {
          toast.error(`Failed to respond.`, { id: loadingToast });
        }
      } catch (error) {
        toast.error("An error occurred.", { id: loadingToast });
      }
    },
    [router]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInquiry) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${selectedInquiry.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setListings(prev => prev.filter(i => i.id !== selectedInquiry.id));
        setDeleteModalOpen(false);
        router.refresh();
        toast.success(`Inquiry removed.`);
      } else {
        toast.error('Failed to remove inquiry.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInquiry, router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?cursor=${nextCursor}`);
      const data = await response.json();
      if (data.success && data.data) {
        setListings((prev) => [...prev, ...data.data.inquiries]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Tenant', 'Status', 'Date Received'];
    const data = filteredInquiries.map((i: any) => [
      i.listing.title,
      i.user.name || i.user.email,
      i.status.toUpperCase(),
      new Date(i.createdAt).toLocaleDateString()
    ]);
    await generateTablePDF('Inquiries_Report', columns, data, {
      title: 'Tenant Inquiries Report',
      subtitle: `Total inquiries: ${filteredInquiries.length}`,
      author: 'Landlord Dashboard'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-2">
      {/* Modals */}
      <AnimatePresence>
        {deleteModalOpen && selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse"><IconAlertTriangle size={32} /></div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Remove Inquiry?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">Remove inquiry from <span className="font-bold text-gray-900 dark:text-white">"{selectedInquiry.user.name || selectedInquiry.user.email}"</span>?</p>
                <div className="flex flex-col w-full gap-2.5">
                  <Button variant="danger" isLoading={isDeleting} onClick={handleConfirmDelete} className="rounded-xl py-3 shadow-lg shadow-red-500/10 text-xs font-black uppercase tracking-widest">Confirm Deletion</Button>
                  <Button outline onClick={() => setDeleteModalOpen(false)} className="rounded-xl py-3 border-gray-100 dark:border-gray-800 text-xs font-black uppercase tracking-widest">Keep Record</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewModalOpen && selectedInquiry && (
          <LandlordInquiryDetailModal 
            inquiry={selectedInquiry}
            onClose={() => setViewModalOpen(false)}
            statusColors={statusColors}
            onOpenConversation={(id) => { setViewModalOpen(false); router.push(`/landlord/inquiries/${id}`); }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-[32px] border border-primary/10 shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-[24px] flex items-center justify-center text-primary shadow-xl shadow-primary/10"><IconMail size={32} strokeWidth={2} /></div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Tenant Inquiries</h1>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 opacity-70">Manage your active inquiries & requests</p>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-row items-center gap-4 w-full xl:w-auto mt-4 lg:mt-0">
            <div className="relative w-full lg:w-72 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors"><IconSearch size={16} strokeWidth={2.5} /></div>
              <input type="text" placeholder="Search tenant or property..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-11 pr-4 text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[{ value: 'newest', label: 'Newest', icon: IconHistory }, { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent }].map((o) => {
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
                  <IconFilter size={14} />Filters {selectedStatus !== 'ALL' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {[{ value: "ALL", label: "All Active", icon: IconInbox }, { value: "PENDING", label: "Pending", icon: IconClock }, { value: "APPROVED", label: "Approved", icon: IconCircleCheck }, { value: "REJECTED", label: "Rejected", icon: IconCircleX }].map((opt: any) => {
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

            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
              <button onClick={() => setViewMode("grid")} className={cn("p-2.5 rounded-xl transition-all duration-300", viewMode === "grid" ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" : "text-gray-400 hover:text-gray-900 dark:hover:text-white")} title="Grid View"><IconLayoutGrid size={18} /></button>
              <button onClick={() => setViewMode("list")} className={cn("p-2.5 rounded-xl transition-all duration-300", viewMode === "list" ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" : "text-gray-400 hover:text-gray-900 dark:hover:text-white")} title="List View"><IconList size={18} /></button>
            </div>
            <GenerateReportButton onGeneratePDF={handleGenerateReport} />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredInquiries.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-gray-300 mb-8 border border-gray-100 dark:border-gray-800"><IconInbox size={48} strokeWidth={1.5} /></div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Box is Empty</h3>
            <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">{searchQuery ? `No inquiries matching "${searchQuery}"` : "No inquiries match filter."}</p>
          </motion.div>
        ) : (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6")}>
            {filteredInquiries.map((inquiry, idx) => (
              <LandlordInquiryCard 
                key={inquiry.id} 
                inquiry={inquiry} 
                idx={idx} 
                viewMode={viewMode}
                statusColors={statusColors}
                statusIcons={statusIcons}
                onRespond={handleRespond}
                onMessage={(id) => router.push(`/landlord/inquiries/${id}`)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button outline className="rounded-[20px] px-10 py-4 border-2 border-gray-100 dark:border-gray-800 hover:border-primary group transition-all" onClick={handleLoadMore} isLoading={isLoadingMore}>
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px] text-gray-500 group-hover:text-primary">{isLoadingMore ? "Processing..." : "Load More Inquiries"}<IconChevronDown className="group-hover:translate-y-1 transition-transform" size={12} strokeWidth={3} /></span>
          </Button>
        </div>
      )}
    </div>
  );
}
