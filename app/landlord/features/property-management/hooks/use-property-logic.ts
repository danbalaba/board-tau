'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generateTablePDF } from '@/utils/pdfGenerator';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
  region?: string;
  country?: string;
  amenities?: any;
  rules?: any;
  features?: any;
  categories?: any[];
  rooms?: any[];
  images?: any[];
  user?: any;
}

export function usePropertyLogic(initialProperties: Property[], initialNextCursor: string | null) {
  const router = useRouter();
  const [listings, setListings] = useState(initialProperties);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setListings(initialProperties);
    setNextCursor(initialNextCursor);
  }, [initialProperties, initialNextCursor]);

  const filteredListings = useMemo(() => {
    let result = [...listings];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.region?.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
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
        toast.success(`Property "${selectedProperty.title}" deleted.`);
      } else {
        toast.error('Failed to delete property.');
      }
    } catch (error) {
      toast.error('Error occurred during deletion.');
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
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Title', 'Price (PHP)', 'Status', 'Rooms', 'Baths', 'Date Added'];
    const data = filteredListings.map(p => [
      p.title,
      p.price.toLocaleString(),
      p.status.toUpperCase(),
      p.roomCount.toString(),
      p.bathroomCount.toString(),
      new Date(p.createdAt).toLocaleDateString()
    ]);
    await generateTablePDF('Properties_Report', columns, data, {
      title: 'Property Portfolio Report',
      subtitle: `Total listings: ${filteredListings.length}`,
      author: 'Landlord Dashboard'
    });
  };

  return {
    listings: filteredListings,
    nextCursor,
    isLoadingMore,
    deleteModalOpen,
    setDeleteModalOpen,
    viewModalOpen,
    setViewModalOpen,
    selectedProperty,
    setSelectedProperty,
    isDeleting,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    handleConfirmDelete,
    handleLoadMore,
    handleGenerateReport
  };
}
