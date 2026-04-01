"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  IconMail,
  IconEye,
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
  IconUser,
  IconCalendarEvent,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconHistory,
  IconTrash,
  IconAlertTriangle,
  IconInfoCircle,
  IconBuilding,
  IconCreditCard,
  IconArrowRight,
  IconMessage
} from "@tabler/icons-react"
import Button from "@/components/common/Button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/utils/helper"
import { toast } from "sonner"
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


interface Inquiry {
  id: string
  listing: {
    id: string
    title: string
    imageSrc: string
  }
  user: {
    id: string
    name: string | null
    email: string
  }
  room?: {
    id: string
    name: string
    price: number
  }
  status: string
  createdAt: string | Date
}

interface LandlordInquiriesClientProps {
  inquiries: {
    inquiries: Inquiry[]
    nextCursor: string | null
  }
}

export default function LandlordInquiriesClient({ inquiries }: LandlordInquiriesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ""

  const [listings, setListings] = useState(inquiries.inquiries)
  const [nextCursor, setNextCursor] = useState(inquiries.nextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState("newest")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync state with props
  useEffect(() => {
    setListings(inquiries.inquiries)
    setNextCursor(inquiries.nextCursor)
  }, [inquiries])

  // Update searchQuery when URL changes
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch)
    }
  }, [initialSearch])

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }

  const statusIcons: Record<string, any> = {
    PENDING: IconClock,
    APPROVED: IconCircleCheck,
    REJECTED: IconCircleX,
  }

  const filteredInquiries = useMemo(() => {
    let result = [...listings];

    // Status filter
    if (selectedStatus !== "ALL") {
      result = result.filter((inquiry) => inquiry.status === selectedStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((inquiry) =>
        inquiry.listing.title.toLowerCase().includes(query) ||
        (inquiry.user.name?.toLowerCase() || '').includes(query) ||
        inquiry.user.email.toLowerCase().includes(query)
      )
    }

    // Sorting
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
  }, [selectedStatus, listings, searchQuery, sortBy])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInquiry) return;
    setIsDeleting(true);

    try {
      // Assuming a DELETE method exists or will be added
      const response = await fetch(`/api/landlord/inquiries?id=${selectedInquiry.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(prev => prev.filter(i => i.id !== selectedInquiry.id));
        setDeleteModalOpen(false);
        router.refresh();
        toast.success(`Inquiry from ${selectedInquiry.user.name || 'Tenant'} has been removed.`);
      } else {
        toast.error('Failed to remove inquiry. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while removing the inquiry.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInquiry, router]);

  const handleRespond = useCallback(
    async (inquiryId: string, status: "APPROVED" | "REJECTED") => {
      const loadingToast = toast.loading(`Marking inquiry as ${status.toLowerCase()}...`)
      try {
        const response = await fetch(`/api/landlord/inquiries?id=${inquiryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })

        if (response.ok) {
          setListings((prev) =>
            prev.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, status } : inquiry))
          )
          router.refresh()
          toast.success(`Inquiry has been ${status.toLowerCase()}.`, { id: loadingToast })
        } else {
          toast.error(`Failed to ${status === 'APPROVED' ? 'approve' : 'reject'} inquiry.`, { id: loadingToast })
        }
      } catch (error) {
        console.error("Error responding:", error)
        toast.error("An unexpected error occurred while processing the response.", { id: loadingToast })
      }
    },
    [router]
  )

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/landlord/inquiries?cursor=${nextCursor}`)
      const data = await response.json()

      if (data.success && data.data) {
        setListings((prev) => [...prev, ...data.data.inquiries])
        setNextCursor(data.data.nextCursor)
      }
    } catch (error) {
      console.error("Error loading more inquiries:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextCursor, isLoadingMore])

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Tenant', 'Status', 'Date Received'];
    const data = filteredInquiries.map((i: any) => [
      i.listing.title,
      i.user.name || i.user.email,
      i.status.toUpperCase(),
      new Date(i.createdAt).toLocaleDateString()
    ]);

    await generateTablePDF(
      'Inquiries_Report',
      columns,
      data,
      {
        title: 'Tenant Inquiries Report',
        subtitle: `Detailed view of all ${filteredInquiries.length} inquiries received`,
        author: 'Landlord Dashboard'
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-2">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse">
                  <IconAlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Remove Inquiry?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                  Are you sure you want to remove the inquiry from <span className="font-bold text-gray-900 dark:text-white">"{selectedInquiry.user.name || selectedInquiry.user.email}"</span>?
                </p>
                <div className="flex flex-col w-full gap-2.5">
                  <Button
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleConfirmDelete}
                    className="rounded-xl py-3 shadow-lg shadow-red-500/10 text-xs font-black uppercase tracking-widest"
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    outline
                    onClick={() => setDeleteModalOpen(false)}
                    className="rounded-xl py-3 border-gray-100 dark:border-gray-800 text-xs font-black uppercase tracking-widest"
                  >
                    Keep Record
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {viewModalOpen && selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-5xl w-full shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IconX size={18} />
              </button>

              <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Section */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg border-2 border-white dark:border-gray-800">
                    {selectedInquiry.listing.imageSrc ? (
                      <img src={selectedInquiry.listing.imageSrc} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                        <IconMail size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border mb-3",
                      statusColors[selectedInquiry.status]
                    )}>
                      {selectedInquiry.status}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                      {selectedInquiry.listing.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID: {selectedInquiry.id}</span>
                    </div>
                  </div>
                </div>

                {/* Tenant Info Section */}
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <IconUser size={12} className="text-primary" />
                    Interested Tenant
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg">
                      {selectedInquiry.user.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{selectedInquiry.user.name || 'Anonymous Tenant'}</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{selectedInquiry.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Room Preference', value: selectedInquiry.room?.name || 'Full Unit', icon: IconBuilding, color: 'text-primary' },
                    { label: 'Estimated Rate', value: selectedInquiry.room ? `₱${selectedInquiry.room.price.toLocaleString()}` : 'Varies', icon: IconCreditCard, color: 'text-emerald-500' },
                    { label: 'Received Date', value: new Date(selectedInquiry.createdAt).toLocaleDateString(), icon: IconCalendarEvent, color: 'text-blue-500' },
                    { label: 'Inquiry Status', value: selectedInquiry.status, icon: IconInfoCircle, color: 'text-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className={cn("w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2", item.color)}>
                        <item.icon size={14} />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}                <div className="flex flex-row justify-center items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={() => {
                      setViewModalOpen(false);
                      router.push(`/landlord/inquiries/${selectedInquiry.id}`);
                    }}
                    className="rounded-xl w-auto py-3 px-10 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <IconEye size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Open Conversation</span>
                  </Button>
                  <Button
                    outline
                    onClick={() => setViewModalOpen(false)}
                    className="rounded-xl w-auto py-3 px-10 text-xs font-black uppercase tracking-widest"
                  >
                    Close
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-[24px] border border-primary/10 shadow-sm"
      >
        {/* Background clipping wrapper */}
        <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary shadow-lg">
              <IconMail size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Tenant Inquiries
              </h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5 opacity-70">
                Manage your active inquiries & requests
              </p>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-row items-center gap-3 w-full xl:w-auto mt-4 lg:mt-0">
            {/* Search Input */}
            <div className="relative w-full lg:w-44 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <IconSearch size={16} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search tenant or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-11 pr-4 text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Sorting */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
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
                      "flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
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
            <SectionSearch
              section="inquiries"
              placeholder="Search tenant or property..."
              onSearchChange={setSearchQuery}
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
                <button className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />
                  Filters {selectedStatus !== 'ALL' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {[
                    { value: "ALL", label: "All Active", icon: IconInbox },
                    { value: "PENDING", label: "Pending", icon: IconClock },
                    { value: "APPROVED", label: "Approved", icon: IconCircleCheck },
                    { value: "REJECTED", label: "Rejected", icon: IconCircleX },
                  ].map((option: any) => {
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

            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm ml-auto">
            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  viewMode === "list"
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
                title="List View"
              >
                <IconList size={16} />
              </button>
              <GenerateReportButton 
                onGeneratePDF={handleGenerateReport}
              />
            </div>

            <GenerateReportButton
              onGeneratePDF={handleGenerateReport}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredInquiries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-gray-300 mb-8 border border-gray-100 dark:border-gray-800">
              <IconInbox size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Box is Empty</h3>
            <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? `No inquiries found matching "${searchQuery}"` : "No inquiries currently match your filter criteria."}
            </p>
            {searchQuery && (
              <Button outline onClick={() => setSearchQuery("")} className="mt-8 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {filteredInquiries.map((inquiry) => {
              const renderStatusIcon = (status: string, size = 12, strokeWidth = 3) => {
                switch (status) {
                  case 'PENDING': return <IconClock size={size} strokeWidth={strokeWidth} />;
                  case 'APPROVED': return <IconCircleCheck size={size} strokeWidth={strokeWidth} />;
                  case 'REJECTED': return <IconCircleX size={size} strokeWidth={strokeWidth} />;
                  default: return <IconClock size={size} strokeWidth={strokeWidth} />;
                }
              };

              return viewMode === 'grid' ? (
                <div
                  key={inquiry.id}
                  className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm flex flex-col"
                >
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
                    {inquiry.listing.imageSrc ? (
                      <img
                        src={inquiry.listing.imageSrc}
                        alt={inquiry.listing.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <IconMail size={32} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
                        statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
                      )}>
                        {renderStatusIcon(inquiry.status, 12, 3)}
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {inquiry.listing.title}
                    </h3>

                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs uppercase ring-4 ring-white dark:ring-gray-800">
                        {inquiry.user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{inquiry.user.name || 'Anonymous User'}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none truncate">Perspective Tenant</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {inquiry.room && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Room</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                            {inquiry.room.name}
                          </div>
                        </div>
                      )}
                      {inquiry.room && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Rate</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            ₱{inquiry.room.price.toLocaleString()}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date Received</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          <IconCalendarEvent size={12} className="text-primary" />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      outline
                      onClick={() => router.push(`/landlord/inquiries/${inquiry.id}`)}
                      className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <IconMessage size={14} />
                        Message
                      </span>
                    </Button>

                    {inquiry.status === "PENDING" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleRespond(inquiry.id, "APPROVED")}
                          className="rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <IconCheck size={14} />
                            Approve
                          </span>
                        </Button>
                        <Button
                          outline
                          onClick={() => handleRespond(inquiry.id, "REJECTED")}
                          className="rounded-xl py-2.5 border-red-200 text-red-500"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <IconX size={14} />
                            Reject
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={inquiry.id}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                        {inquiry.listing.imageSrc ? (
                          <img
                            src={inquiry.listing.imageSrc}
                            alt={inquiry.listing.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <IconMail size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest",
                            statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
                          )}>
                            {renderStatusIcon(inquiry.status, 10, 3)}
                            {inquiry.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {inquiry.listing.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                            {inquiry.user.name?.charAt(0) || 'U'}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{inquiry.user.name || 'Anonymous User'}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          {inquiry.room && (
                            <span className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-primary/5 text-primary rounded text-[9px] uppercase tracking-wider">Room</span>
                              {inquiry.room.name} • ₱{inquiry.room.price.toLocaleString()}/mo
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <IconCalendarEvent size={12} className="text-primary/70" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-40 flex-shrink-0 pt-4 md:pt-0 border-t md:border-none border-gray-100 dark:border-gray-800">
                      <Button
                        outline
                        onClick={() => router.push(`/landlord/inquiries/${inquiry.id}`)}
                        className="w-full rounded-xl py-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        Message
                      </Button>
                      
                      {inquiry.status === "PENDING" && (
                        <>
                          <Button
                            onClick={() => handleRespond(inquiry.id, "APPROVED")}
                            className="w-full rounded-xl py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <IconCheck size={12} />
                              Approve
                            </span>
                          </Button>
                          <Button
                            outline
                            onClick={() => handleRespond(inquiry.id, "REJECTED")}
                            className="w-full rounded-xl py-2 text-[10px] font-black uppercase tracking-widest border-red-200 text-red-500"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <IconX size={12} />
                              Reject
                            </span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 bg-white/30 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700/50 p-2 shadow-xl shadow-gray-200/10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <ModernLoadMore
          onLoadMore={handleLoadMore}
          isLoading={isLoadingMore}
          hasMore={!!nextCursor}
          label="View More Inquiries"
          loadingLabel="Synchronizing Messages..."
        />
      </div>
    </div>
  )
}
