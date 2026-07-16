'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { getAllLandlordProperties } from '@/services/landlord/properties';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

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
  const queryClient = useQueryClient();
  const responsiveToast = useResponsiveToast();
  
  // 1. Infinite Query for Listings
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
  } = useInfiniteQuery({
    queryKey: ['properties'],
    queryFn: async ({ pageParam }) => {
      const url = pageParam 
        ? `/api/landlord/properties?cursor=${pageParam}` 
        : `/api/landlord/properties`;
      const response = await fetch(url);
      const data = await response.json();
      return data.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [{ listings: initialProperties, nextCursor: initialNextCursor }],
      pageParams: [null],
    },
  });

  // Flatten pages into a single array
  const listings = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.listings) || [];
  }, [infiniteData]);

  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isArchived, setIsArchived] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy, isArchived]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 2. Mutations
  const archiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const res = await fetch(`/api/landlord/properties/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      responsiveToast.success({ 
        title: 'SUCCESS', 
        description: variables.isArchived ? 'Property archived' : 'Property restored' 
      });
      setArchiveModalOpen(false);
    },
    onError: () => responsiveToast.error({ title: 'ERROR', description: 'Failed to update archive status' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/landlord/properties?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setDeleteModalOpen(false);
      responsiveToast.success({ title: 'SUCCESS', description: 'Property deleted successfully.' });
    },
    onError: () => responsiveToast.error({ title: 'ERROR', description: 'Failed to delete property.' }),
  });

  // Unique categories extraction
  const uniqueCategories = useMemo(() => {
    const cats = listings.reduce((acc: string[], property) => {
      property.categories?.forEach((cat: any) => {
        const name = cat?.category?.name || (typeof cat === 'string' ? cat : cat.name);
        if (name && !acc.includes(name)) acc.push(name);
      });
      return acc;
    }, []);
    return cats.sort();
  }, [listings]);

  // Local filtering
  const filteredListings = useMemo(() => {
    let result = listings.filter(p => !!(p as any).isArchived === isArchived);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.region?.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => 
        p.categories?.some((cat: any) => {
          const name = cat?.category?.name || (typeof cat === 'string' ? cat : cat.name);
          return name === categoryFilter;
        })
      );
    }

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'status': return (a.status || '').localeCompare(b.status || '');
        case 'newest':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [listings, sortBy, searchQuery, categoryFilter, isArchived]);

  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredListings, currentPage, itemsPerPage]);

  const handleConfirmArchive = async () => {
    if (!selectedProperty) return;
    await archiveMutation.mutateAsync({ 
      id: selectedProperty.id, 
      isArchived: !(selectedProperty as any).isArchived 
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedProperty) return;
    await deleteMutation.mutateAsync(selectedProperty.id);
  };

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('all');
    setIsArchived(false);
    setSearchInput('');
    setSearchQuery('');
    setSortBy('newest');
    setArchiveModalOpen(false);
  }, []);

  const handleGenerateReport = async (dateRange?: DateRange) => {
    try {
      let exportData = filteredListings;
      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter(p => {
          const createdAt = new Date(p.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalValue = exportData.reduce((acc, p) => acc + p.price, 0);
      const totalRooms = exportData.reduce((acc, p) => acc + (p.roomCount || 0), 0);
      const totalListings = exportData.length;
      let summaryData: any[] = [];
      let subtitle = `Comprehensive auditing report for ${totalListings} active assets`;

      if (categoryFilter !== 'all') {
        const avgPrice = totalListings > 0 ? totalValue / totalListings : 0;
        summaryData = [
          { label: 'Category', value: `${categoryFilter}` },
          { label: 'Portfolio Value', value: `₱${totalValue.toLocaleString()}` },
          { label: 'Avg Rate', value: `₱${Math.round(avgPrice).toLocaleString()}` }
        ];
        subtitle = `Auditing ${categoryFilter} properties for ${totalListings} assets`;
      } else {
        const avgPrice = totalListings > 0 ? totalValue / totalListings : 0;
        summaryData = [
          { label: 'Portfolio Value', value: `PHP ${totalValue.toLocaleString()}`, subValue: 'Total market value' },
          { label: 'Room Inventory', value: `${totalRooms} Units`, subValue: `${totalListings} Properties` },
          { label: 'Avg Rate', value: `PHP ${Math.round(avgPrice).toLocaleString()}`, subValue: 'Per listing' }
        ];
      }

      const columns = ['Title', 'Price (PHP)', 'Status', 'Rooms', 'Baths', 'Date Added'];
      const data = exportData.map(p => [
        p.title, p.price.toLocaleString(), p.status.toUpperCase(), 
        p.roomCount.toString(), p.bathroomCount.toString(), 
        new Date(p.createdAt).toLocaleDateString()
      ]);

      await generateTablePDF('Properties_Report', columns, data, {
        title: 'Property Portfolio Report',
        subtitle: subtitle,
        author: 'Landlord Management System',
        summaryData: summaryData
      });
      responsiveToast.success({ title: 'SUCCESS', description: `Generated enterprise report` });
    } catch (error) {
      responsiveToast.error({ title: 'ERROR', description: 'Failed to generate report' });
    }
  };

  return {
    listings: paginatedListings,
    totalListings: filteredListings.length,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    nextCursor: infiniteData?.pages[infiniteData.pages.length - 1].nextCursor,
    isLoadingMore: isFetchingNextPage,
    deleteModalOpen,
    setDeleteModalOpen,
    viewModalOpen,
    setViewModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    selectedProperty,
    setSelectedProperty,
    isDeleting: deleteMutation.isPending,
    isArchiving: archiveMutation.isPending,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    categoryFilter,
    setCategoryFilter,
    isArchived,
    setIsArchived,
    uniqueCategories,
    isLoading: isQueryLoading,
    searchQuery: searchInput,
    setSearchQuery: setSearchInput,
    handleConfirmDelete,
    handleLoadMore: () => { fetchNextPage() },
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive
  };
}

