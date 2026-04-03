'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconBuilding,
  IconPlus,
  IconChevronDown,
  IconAlertTriangle,
  IconCalendarEvent,
  IconHistory,
  IconCircleCheck,
  IconSortAscending,
  IconSortDescending,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { toast } from 'sonner';
import Link from 'next/link';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { generateTablePDF } from '@/utils/pdfGenerator';

import LandlordPropertyCard from './components/landlord-property-card';
import LandlordPropertyDetailsModal from './components/landlord-property-details-modal';
import LandlordFormHeader from '@/app/landlord/features/shared/landlord-form-header';
import { Property } from './types';

interface LandlordPropertyManagementFeatureProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

export default function LandlordPropertyManagementFeature({ properties }: LandlordPropertyManagementFeatureProps) {
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

  useEffect(() => {
    setListings(properties.listings);
    setNextCursor(properties.nextCursor);
  }, [properties]);

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
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
  }, [listings, sortBy]);

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
    <div className="space-y-8 p-1 pb-20">
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
          <LandlordPropertyDetailsModal 
            property={selectedProperty}
            onClose={() => setViewModalOpen(false)}
            statusColors={statusColors}
            formatStatus={formatStatus}
          />
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
            <GenerateReportButton onGeneratePDF={handleGenerateReport} />
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
      </motion.div>

      {/* Properties List */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
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
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        )}>
          {sortedListings.map((property, idx) => (
            <LandlordPropertyCard 
              key={property.id}
              property={property}
              idx={idx}
              viewMode={viewMode}
              statusColors={statusColors}
              formatStatus={formatStatus}
              onViewDetails={(p) => {
                setSelectedProperty(p);
                setViewModalOpen(true);
              }}
              onDelete={(p) => {
                setSelectedProperty(p);
                setDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button 
            outline 
            className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching properties...' : 'Load More Properties'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
