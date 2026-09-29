'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { clearDraftFromStorage } from '@/utils/draftStorage';

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
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Trigger loader animation when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, isArchived]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, isArchived]);

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

  // Unique property types / categories extraction
  const uniqueCategories = useMemo(() => {
    const cats = listings.reduce((acc: string[], property) => {
      const typeName = (property as any).propertyType?.name 
        || (typeof (property as any).propertyType === 'string' ? (property as any).propertyType : null)
        || property.categories?.[0]?.category?.name 
        || (typeof property.categories?.[0] === 'string' ? property.categories[0] : property.categories?.[0]?.name);

      if (typeName && !acc.includes(typeName)) {
        acc.push(typeName);
      }
      return acc;
    }, []);

    // Also include categories inside categories array if any
    listings.forEach(p => {
      p.categories?.forEach((cat: any) => {
        const name = cat?.category?.name || (typeof cat === 'string' ? cat : cat?.name);
        if (name && !cats.includes(name)) cats.push(name);
      });
    });

    return cats.sort();
  }, [listings]);

  // Local filtering
  const filteredListings = useMemo(() => {
    let result = listings.filter(p => !!(p as any).isArchived === isArchived);
    
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const titleMatch = p.title?.toLowerCase().includes(query);
        const regionMatch = p.region?.toLowerCase().includes(query);
        
        const categoryMatch = p.categories?.some((cat: any) => {
          const name = cat?.category?.name || (typeof cat === 'string' ? cat : cat?.name);
          return name?.toLowerCase().includes(query);
        });
        
        const propertyTypeMatch = (p as any).propertyType?.name?.toLowerCase().includes(query) || (typeof (p as any).propertyType === 'string' && (p as any).propertyType.toLowerCase().includes(query));

        // For short queries (< 4 chars like "ha", "apt", "bh"), match title, region, category & propertyType only
        if (query.length < 4) {
          return titleMatch || regionMatch || categoryMatch || propertyTypeMatch;
        }

        const descriptionMatch = p.description?.toLowerCase().includes(query);
        return titleMatch || regionMatch || categoryMatch || propertyTypeMatch || descriptionMatch;
      });
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => {
        const propType = (p as any).propertyType?.name || (typeof (p as any).propertyType === 'string' ? (p as any).propertyType : null);
        const matchesType = propType === categoryFilter;
        const matchesCategory = p.categories?.some((cat: any) => {
          const name = cat?.category?.name || (typeof cat === 'string' ? cat : cat.name);
          return name === categoryFilter;
        });
        return matchesType || matchesCategory;
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
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
  }, [listings, sortBy, searchQuery, categoryFilter, statusFilter, isArchived]);

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
    const propertyId = selectedProperty.id;
    await deleteMutation.mutateAsync(propertyId);
    try {
      await clearDraftFromStorage(`boardtau_property_editor_draft_${propertyId}`);
    } catch (e) {
      console.warn('Failed to clear property draft from storage on delete:', e);
    }
  };

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('all');
    setStatusFilter('all');
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
    allListings: listings,
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
    statusFilter,
    setStatusFilter,
    isArchived,
    setIsArchived,
    uniqueCategories,
    isLoading: isQueryLoading || isFilterLoading,
    searchQuery: searchInput,
    setSearchQuery: setSearchInput,
    handleConfirmDelete,
    handleLoadMore: () => { fetchNextPage() },
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive
  };
}

