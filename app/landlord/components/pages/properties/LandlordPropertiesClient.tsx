'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  IconSearchOff
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  const [listings, setListings] = useState(properties.listings);
  const [nextCursor, setNextCursor] = useState(properties.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setListings(properties.listings);
    setNextCursor(properties.nextCursor);
  }, [properties]);

  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];

    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result.sort((a, b) => {
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
  }, [listings, sortBy, searchQuery]);

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
        setListings((prev) => [...prev, ...data.data.listings]);
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
    const data = filteredAndSortedListings.map(p => [
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
        subtitle: `A comprehensive list of your current property listings (${filteredAndSortedListings.length} total)`,
        author: 'Landlord Dashboard'
      }
    );
  };

  const clearSearch = () => {
    router.push('/landlord/properties');
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
              className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-xl w-full shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IconX size={18} />
              </button>

              <div className="flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Section */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-white dark:border-gray-800">
                    {selectedProperty.imageSrc ? (
                      <img src={selectedProperty.imageSrc} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><IconBuilding size={32} className="text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3",
                      statusColors[selectedProperty.status]
                    )}>
                      {formatStatus(selectedProperty.status)}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2">{selectedProperty.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{selectedProperty.description}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Monthly Price', value: `₱${selectedProperty.price.toLocaleString()}`, icon: IconBuilding, color: 'text-primary' },
                    { label: 'Room Count', value: selectedProperty.roomCount, icon: IconBuilding, color: 'text-blue-500' },
                    { label: 'Bathrooms', value: selectedProperty.bathroomCount, icon: IconBath, color: 'text-purple-500' },
                    { label: 'Registered', value: new Date(selectedProperty.createdAt).toLocaleDateString(), icon: IconPlus, color: 'text-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className={cn("w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center mb-2 shadow-sm", item.color)}>
                        <item.icon size={14} />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-base font-black text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Link href={`/landlord/properties/${selectedProperty.id}/edit`} className="w-full sm:w-auto">
                    <Button className="rounded-xl w-full py-2.5 px-6 shadow-lg shadow-primary/20 flex items-center justify-center">
                      <IconEdit className="mr-2" size={12} />
                      Open Full Editor
                    </Button>
                  </Link>
                  <Button outline onClick={() => setViewModalOpen(false)} className="rounded-xl w-full sm:w-auto py-2.5 px-6 flex items-center justify-center">
                    Close Window
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
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {searchQuery && (
              <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-right-4 duration-500">
                <IconSearchOff size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Search: {searchQuery}</span>
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-primary/20 rounded-md transition-colors text-primary"
                >
                  <IconX size={12} />
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconCalendarEvent },
                { value: 'oldest', label: 'Oldest', icon: IconHistory },
                { value: 'price_desc', label: 'High Price', icon: IconSortDescending },
                { value: 'price_asc', label: 'Low Price', icon: IconSortAscending },
                { value: 'status', label: 'Status', icon: IconCircleCheck },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                    )}
                  >
                    <Icon size={14} className={cn("transition-transform duration-300", isSelected && "rotate-3")} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
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

            <GenerateReportButton
              onGeneratePDF={handleGenerateReport}

            />

            <Link href="/landlord/properties/create" className="w-full sm:w-auto">
              <Button className="rounded-xl w-full px-5 py-3 shadow-xl shadow-primary/20 group bg-primary text-white">
                <span className="flex items-center gap-2">
                  <IconPlus size={11} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-xs uppercase tracking-widest font-black">Add Property</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
      </motion.div>

      {/* Properties List */}
      {filteredAndSortedListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-6 text-gray-300">
            {searchQuery ? <IconSearchOff size={32} /> : <IconBuilding size={32} />}
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            {searchQuery ? `No matches for "${searchQuery}"` : "No properties listed yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed font-medium">
            {searchQuery
              ? "Try adjusting your search or clear it to see all properties."
              : "Your rental portfolio is currently empty. Start growing your business by listing your first property today."}
          </p>
          {searchQuery ? (
            <Button onClick={clearSearch} className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20">
              Clear Search
            </Button>
          ) : (
            <Link href="/landlord/properties/create">
              <Button className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20">
                <IconPlus className="mr-2" size={12} />
                <span className="text-xs uppercase tracking-widest font-black">Add Property</span>
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        )}>
          {filteredAndSortedListings.map((property, idx) => (
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

      <div className="mt-8 bg-white/20 dark:bg-gray-800/10 backdrop-blur-sm rounded-[32px] border border-gray-100/50 dark:border-gray-800/50 p-2 transition-all duration-700">
        <ModernLoadMore
          onLoadMore={handleLoadMore}
          isLoading={isLoadingMore}
          hasMore={!!nextCursor && !searchQuery}
          label="See More Properties"
          loadingLabel="Discovering Properties..."
        />
      </div>
    </div>
  );
}
