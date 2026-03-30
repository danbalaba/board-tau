"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  IconMail,
  IconEye,
  IconCheck,
  IconX,
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
  IconMessage,
  IconLoader2,
  IconChevronDown
} from "@tabler/icons-react"
import ModernSearchInput from "@/components/common/ModernSearchInput"
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
  const [listings, setListings] = useState(inquiries.inquiries)
  const [nextCursor, setNextCursor] = useState(inquiries.nextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [filteredInquiries, setFilteredInquiries] = useState(listings)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync state with props
  useEffect(() => {
    setListings(inquiries.inquiries)
    setNextCursor(inquiries.nextCursor)
  }, [inquiries])

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

  const displayedInquiries = useMemo(() => {
    let result = [...filteredInquiries];

    // Status filter
    if (selectedStatus !== "ALL") {
      result = result.filter((inquiry) => inquiry.status === selectedStatus);
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
  }, [selectedStatus, filteredInquiries, sortBy])

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
        const newInquiries = data.data.inquiries;
        setListings((prev) => [...prev, ...newInquiries]);
        // Sync filteredInquiries for search
        setFilteredInquiries((prev) => [...prev, ...newInquiries]);
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
        className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 md:p-5 rounded-[24px] border border-primary/10 shadow-sm"
      >
        {/* Decorative elements - Contained for dropdown visibility */}
        <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-38 h-38 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 -mb-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl " />
        </div>

        <div className="relative z-20 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-[18px] flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <IconMail size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Inquiries
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                Active tenant requests
              </p>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-row items-center gap-4 w-full xl:w-auto mt-4 lg:mt-0">
            {/* Search Input */}
            {/* Optimized Search Bar */}
            <div className="w-full lg:w-80">
              <ModernSearchInput
                data={listings}
                searchKeys={['user.name', 'user.email', 'listing.title']}
                onSearch={setFilteredInquiries}
                placeholder="Search inquiries..."
                onSuggestionClick={(inquiry) => {
                   setSelectedInquiry(inquiry);
                   setViewModalOpen(true);
                }}
                renderSuggestion={(inquiry) => (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm shadow-primary/20">
                      {inquiry.user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0 px-1">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{inquiry.user.name || 'Anonymous User'}</p>
                      <p className="text-[9px] font-bold text-primary tracking-widest uppercase truncate mt-0.5">{inquiry.listing.title}</p>
                    </div>
                  </div>
                )}
            <div className="relative w-full lg:w-72 group">
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
            <div className="flex flex-wrap items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon size={12} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optimized Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={12} />
                  <span>Filters</span> {selectedStatus !== 'ALL' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
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

            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-400 hover:text-gray-900"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  viewMode === "list"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-400 hover:text-gray-900"
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
      </motion.div>

      <AnimatePresence mode="wait">
        {displayedInquiries.length === 0 ? (
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
              No inquiries currently match your filter criteria.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-6"
            )}
          >
            {displayedInquiries.map((inquiry, idx) => {
              const StatusIcon = statusIcons[inquiry.status] || IconClock;

              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group relative bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/40 transition-all duration-500 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 overflow-hidden",
                    viewMode === "list" && "flex flex-col sm:flex-row gap-8 items-center"
                  )}
                >
                  <div className={cn(
                    "relative rounded-[24px] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
                    viewMode === "grid" ? "h-48 mb-5 w-full" : "w-full sm:w-48 h-40"
                  )}>
                    {inquiry.listing.imageSrc ? (
                      <img
                        src={inquiry.listing.imageSrc}
                        alt={inquiry.listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <IconMail size={40} strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Status Badge overlay */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
                        statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
                      )}>
                        <StatusIcon size={12} strokeWidth={3} />
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 w-full z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 pr-4">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight truncate group-hover:text-primary transition-colors">
                          {inquiry.listing.title}
                        </h3>

                        <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-primary/20">
                            {inquiry.user.name?.charAt(0) || <IconUser size={14} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{inquiry.user.name || 'Anonymous User'}</p>
                          </div>
                        </div>
                      </div>


                    </div>

                    {inquiry.room && (
                      <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Room Interest</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate">{inquiry.room.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Rate</p>
                          <p className="text-xs font-black text-primary">₱{inquiry.room.price.toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1.5">
                        <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        outline
                        onClick={() => router.push(`/landlord/inquiries/${inquiry.id}`)}
                        className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <IconMessage size={14} />
                          Message
                        </span>
                      </Button>

                      {inquiry.status === "PENDING" && (
                        <div className="flex gap-3 basis-[100%] sm:basis-auto flex-1">
                          <Button
                            onClick={() => handleRespond(inquiry.id, "APPROVED")}
                            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 group/btn"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                              Approve
                            </span>
                          </Button>
                          <Button
                            outline
                            onClick={() => handleRespond(inquiry.id, "REJECTED")}
                            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <IconX size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                              Reject
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtle background glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Pagination / Load More */}
      <AnimatePresence>
        {nextCursor && displayedInquiries.length >= 16 && (
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
                        Discovering more inquiries
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
                      Explore More Inquiries
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
                Showing {displayedInquiries.length} inquiries
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
