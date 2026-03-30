'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconBath,
  IconChevronDown,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconDots,
  IconSortAscending,
  IconSortDescending,
  IconCalendarEvent,
  IconHistory,
  IconCircleCheck,
  IconInbox,
  IconTag,
  IconCalendarFilled,
  IconCurrencyPeso,
  IconLayoutGrid,
  IconList,
  IconLoader2
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const ModernSelect = dynamic(() => import('@/components/common/ModernSelect'), { ssr: false });
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

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
}

interface LandlordPropertiesClientProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

export default function LandlordPropertiesClient({ properties }: LandlordPropertiesClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState(properties.listings);
  const [nextCursor, setNextCursor] = useState(properties.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredListings, setFilteredListings] = useState(listings);

  // Sync state with props when the page refreshes
  useEffect(() => {
    setListings(properties.listings);
    setNextCursor(properties.nextCursor);
  }, [properties]);

  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filteredListings, sortBy]);

  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Newest', icon: IconHistory },
    { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
    { value: 'price_asc', label: 'Price Low', icon: IconSortAscending },
    { value: 'price_desc', label: 'Price High', icon: IconSortDescending },
    { value: 'status', label: 'Status', icon: IconCircleCheck },
  ], []);

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    flagged: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  const formatStatus = useCallback((status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProperty) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/landlord/properties?id=${selectedProperty.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(prev => prev.filter(p => p.id !== selectedProperty.id));
        setDeleteModalOpen(false);
        router.refresh();
        toast.success(`Property "${selectedProperty.title}" has been deleted.`);
      } else {
        toast.error('Failed to delete property. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while deleting the property.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProperty, router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/properties?cursor=${nextCursor}`);
      const data = await response.json();

      if (data.success && data.data) {
        const newListings = data.data.listings;
        setListings((prev) => [...prev, ...newListings]);
        // Critical Fix: Sync filteredListings so search results include new items
        setFilteredListings((prev) => [...prev, ...newListings]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error loading more properties:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Title', 'Price (PHP)', 'Status', 'Rooms', 'Baths', 'Date Added'];
    const data = sortedListings.map(p => [
      p.title,
      p.price.toLocaleString(),
      p.status.toUpperCase(),
      p.roomCount.toString(),
      p.bathroomCount.toString(),
      new Date(p.createdAt).toLocaleDateString()
    ]);

    await generateTablePDF(
      'Properties_Report',
      columns,
      data,
      {
        title: 'Property Portfolio Report',
        subtitle: `A comprehensive list of your current property listings (${sortedListings.length} total)`,
        author: 'Landlord Dashboard'
      }
    );
  };

  return (
    <div className="space-y-8 p-1">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && selectedProperty && (
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
              className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse">
                  <IconAlertTriangle size={32} />
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Property?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">"{selectedProperty.title}"</span>? This action is permanent.
                </p>

                <div className="flex flex-col w-full gap-2.5">
                  <Button
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleConfirmDelete}
                    className="rounded-lg py-3 shadow-lg shadow-red-500/10 text-sm"
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    outline
                    onClick={() => setDeleteModalOpen(false)}
                    className="rounded-lg py-3 border-gray-200 dark:border-gray-700 text-sm"
                  >
                    Keep Property
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Property Modal */}
      <AnimatePresence>
        {viewModalOpen && selectedProperty && (
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
              className="relative bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 max-w-2xl w-full shadow-2xl overflow-hidden group"
            >
              {/* Background Accent Bloom */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-6 right-6 z-50 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all active:scale-90"
              >
                <IconX size={20} />
              </button>

              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Hero Section */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProperty.id}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full"
                    >
                      {selectedProperty.imageSrc ? (
                        <img 
                          src={selectedProperty.imageSrc} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                          alt={selectedProperty.title} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <IconBuilding size={80} className="text-gray-300" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Overlay Polish */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-8 right-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col gap-3"
                    >
                      <div className={cn(
                        "inline-flex items-center self-start px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg backdrop-blur-md",
                        statusColors[selectedProperty.status]
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-2 animate-pulse", statusColors[selectedProperty.status].split(' ')[0].replace('bg-', 'bg-').replace('/10', ''))} />
                        {formatStatus(selectedProperty.status)}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight">
                        {selectedProperty.title}
                      </h3>
                    </motion.div>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-10">
                  {/* Detailed Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Price (Monthly)', value: `₱${selectedProperty.price.toLocaleString()}`, icon: IconCurrencyPeso, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'Bedroom Units', value: selectedProperty.roomCount, icon: IconBuilding, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Shared Baths', value: selectedProperty.bathroomCount, icon: IconBath, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Created On', value: new Date(selectedProperty.createdAt).toLocaleDateString(), icon: IconCalendarFilled, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm", item.bg, item.color)}>
                          <item.icon size={18} strokeWidth={2.5} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">{item.label}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white leading-none tracking-tight">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Description Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 bg-gray-50 dark:bg-gray-800 inline-block px-3 py-1.5 rounded-full">Overview Content</h4>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2">
                       "{selectedProperty.description}"
                    </p>
                  </motion.div>

                  {/* Action Footer */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href={`/landlord/properties/${selectedProperty.id}/edit`} className="flex-1">
                      <Button className="w-full rounded-2xl py-4 px-8 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group/btn">
                        <span className="flex items-center justify-center gap-2">
                          <IconEdit size={14} className="group-hover/btn:rotate-12 transition-transform" />
                          Launch Full Editor
                        </span>
                      </Button>
                    </Link>
                    <Button 
                      outline 
                      onClick={() => setViewModalOpen(false)} 
                      className="flex-1 rounded-2xl py-4 px-8 text-[11px] font-black uppercase tracking-widest border-gray-100 dark:border-gray-800"
                    >
                      Return to Listings
                    </Button>
                  </div>
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
        className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 md:p-5 rounded-2xl border border-primary/10 shadow-sm"
      >
        {/* Abstract background elements - Contained to avoid bleed without cutting off search dropdown */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
              <IconBuilding size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Properties
              </h1>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                Manage your rental portfolio
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Optimized Search Bar */}
            <div className="w-full lg:w-72">
              <ModernSearchInput
                data={listings}
                searchKeys={['title', 'id', 'status']}
                onSearch={setFilteredListings}
                placeholder="Search properties..."
                onSuggestionClick={(property) => {
                  setSelectedProperty(property);
                  setViewModalOpen(true);
                }}
                renderSuggestion={(property) => (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {property.imageSrc ? (
                        <img src={property.imageSrc} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <IconBuilding size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{property.title}</p>
                      <p className="text-[10px] font-bold text-primary tracking-widest uppercase">₱{property.price.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconCalendarEvent },
                { value: 'oldest', label: 'Oldest', icon: IconHistory },
                { value: 'price_desc', label: 'High', icon: IconSortDescending },
                { value: 'price_asc', label: 'Low', icon: IconSortAscending },
                { value: 'status', label: 'Status', icon: IconCircleCheck },
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
                    <Icon size={12} className={cn("transition-transform duration-300", isSelected && "rotate-3")} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                )}
                title="List View"
              >
                <IconList size={16} />
              </button>
            </div>

            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport} 

            />

            <Link href="/landlord/properties/create" className="w-full sm:w-auto">
              <Button className="rounded-xl w-full px-4 py-2.5 shadow-lg shadow-primary/20 group">
              <Button className="rounded-xl w-full px-5 py-3 shadow-xl shadow-primary/20 group bg-primary text-white">
                <span className="flex items-center gap-2">
                  <IconPlus size={10} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[11px] uppercase tracking-wider font-black">Add Property</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Properties List */}
      {listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-6 text-gray-300">
            <IconBuilding size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No properties listed yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed font-medium">
            Your rental portfolio is currently empty. Start growing your business by listing your first property today.
          </p>
          <Link href="/landlord/properties/create">
            <Button className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20">
              <IconPlus className="mr-2" size={12} />
              <span className="text-xs uppercase tracking-widest font-black">Add Property</span>
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        )}>
          {sortedListings.map((property, idx) => (
            viewMode === 'grid' ? (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500"
              >
                {/* Property Image */}
                <div className="relative h-52 overflow-hidden">
                  {property.imageSrc ? (
                    <img
                      src={property.imageSrc}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <IconBuilding size={32} className="text-gray-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-white/50 dark:border-gray-800 flex items-center gap-1.5",
                      statusColors[property.status].split(' ')[1]
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse capitalize", statusColors[property.status].split(' ')[0].replace('bg-', 'bg-').replace('/10', ''))} />
                      {formatStatus(property.status)}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-1 truncate">
                        {property.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{property.roomCount} Rooms • {property.bathroomCount} Baths</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-6">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">/ Mo</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1">
                      <Button className="rounded-xl w-full py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 group/btn">
                        <span className="flex items-center justify-center gap-2">
                          <IconEdit className="group-hover/btn:rotate-12 transition-transform duration-300" size={11} />
                          Edit
                        </span>
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/dots">
                          <IconDots size={12} className="text-gray-400 group-hover/dots:text-primary transition-colors" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-48 p-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              setSelectedProperty(property);
                              setViewModalOpen(true);
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                              <IconEye size={11} className="text-blue-500" />
                            </div>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-red-500 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            onClick={() => {
                              setSelectedProperty(property);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                              <IconTrash size={11} className="text-red-500" />
                            </div>
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* List View Mode */
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/20 p-4 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Property Image */}
                  <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                    {property.imageSrc ? (
                      <img
                        src={property.imageSrc}
                        alt={property.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <IconBuilding size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Property Content */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <div className={cn(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                        statusColors[property.status]
                      )}>
                        {formatStatus(property.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-2">
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconBuilding size={14} className="text-primary" />
                         {property.roomCount} Rooms
                       </span>
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconBath size={14} className="text-blue-500" />
                         {property.bathroomCount} Baths
                       </span>
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconCalendarFilled size={14} className="text-orange-500" />
                         {new Date(property.createdAt).toLocaleDateString()}
                       </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
                      <span className="text-[10px] items-center font-bold uppercase tracking-widest text-gray-400">/ month</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800">
                    <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                        <IconEdit size={16} />
                        <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Edit</span>
                      </button>
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setViewModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center"
                    >
                      <IconEye size={16} />
                      <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">View</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setDeleteModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center"
                    >
                      <IconTrash size={16} />
                      <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}

      {/* Enhanced Pagination / Load More */}
      <AnimatePresence>
        {nextCursor && listings.length >= 16 && (
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
                        Discovering more properties
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
                      Explore More Properties
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
                Showing {listings.length} properties
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
