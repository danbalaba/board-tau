'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  const { data: session } = useSession();
  
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
  const [isInitialHeaderLoading, setIsInitialHeaderLoading] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialHeaderLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Trigger loader animation when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 700);
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

  // Deep Linking from Messaging / Widget ("View Listing")
  const searchParams = useSearchParams();
  const deepListingId = searchParams ? (searchParams.get('listingId') || searchParams.get('propertyId')) : null;
  const processedDeepLink = useRef<string | null>(null);

  useEffect(() => {
    if (!deepListingId || processedDeepLink.current === deepListingId) return;

    const match = listings.find((p: Property) => p.id === deepListingId);
    if (match) {
      setSelectedProperty(match);
      setViewModalOpen(true);
      processedDeepLink.current = deepListingId;
    }
  }, [deepListingId, listings]);

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

  const handleGenerateReport = async (options?: { scope?: 'filtered' | 'all'; format?: string; includeSummary?: boolean; includeGlossary?: boolean; dateRange?: DateRange } | DateRange) => {
    try {
      const isParamDateRange = options && ('from' in options || 'to' in options);
      const dateRange = isParamDateRange ? (options as DateRange) : (options as any)?.dateRange;
      const exportScope = !isParamDateRange && (options as any)?.scope ? (options as any).scope : 'filtered';
      const includeSummary = !isParamDateRange && (options as any)?.includeSummary !== undefined ? (options as any).includeSummary : true;
      const includeGlossary = !isParamDateRange && (options as any)?.includeGlossary !== undefined ? (options as any).includeGlossary : true;

      let exportData = exportScope === 'all' ? listings : filteredListings;

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

      const totalValue = exportData.reduce((acc, p) => acc + (p.price || 0), 0);
      const totalRooms = exportData.reduce((acc, p) => acc + (p.roomCount || 0), 0);
      const totalBaths = exportData.reduce((acc, p) => acc + (p.bathroomCount || 0), 0);
      const totalListings = exportData.length;

      // Calculate Status Distribution for Bar Graph
      const approvedCount = exportData.filter(p => (p.status || '').toLowerCase() === 'approved' || (p.status || '').toLowerCase() === 'active').length;
      const pendingCount = exportData.filter(p => (p.status || '').toLowerCase() === 'pending').length;
      const rejectedCount = exportData.filter(p => (p.status || '').toLowerCase() === 'rejected').length;

      const distributionData = [
        { label: 'Approved / Active', count: approvedCount, percentage: totalListings ? (approvedCount / totalListings) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: 'Pending Review', count: pendingCount, percentage: totalListings ? (pendingCount / totalListings) * 100 : 0, color: [217, 119, 6] as [number, number, number] },
        { label: 'Rejected', count: rejectedCount, percentage: totalListings ? (rejectedCount / totalListings) * 100 : 0, color: [220, 38, 38] as [number, number, number] }
      ];

      // Calculate Category Breakdown for Visual Bar Chart Graph
      const categoryCounts: Record<string, number> = {};
      exportData.forEach(p => {
        const catName = (p as any).propertyType?.name 
          || (typeof (p as any).propertyType === 'string' ? (p as any).propertyType : null)
          || p.categories?.[0]?.category?.name 
          || 'Boarding House';
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      });

      const categoryData = Object.entries(categoryCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate Monthly Trend Trajectory Data for Trend Line Chart
      const monthCounts: Record<string, number> = {};
      exportData.forEach(p => {
        const date = new Date(p.createdAt || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const subtitle = exportScope === 'all'
        ? `All-Time Property Record for ${totalListings} total properties (${approvedCount} Active, ${pendingCount} Pending, ${rejectedCount} Rejected)`
        : `Filtered Report for ${totalListings} properties`;

      const avgPrice = totalListings > 0 ? totalValue / totalListings : 0;
      const summaryData = [
        { label: 'Total Monthly Rent', value: `PHP ${totalValue.toLocaleString()}`, subValue: 'Total monthly rental income' },
        { label: 'Total Properties', value: `${totalListings} Properties`, subValue: `${approvedCount} Approved | ${pendingCount} Pending` },
        { label: 'Total Rooms', value: `${totalRooms} Rooms`, subValue: `${totalBaths} Total Bathrooms` },
        { label: 'Average Price', value: `PHP ${Math.round(avgPrice).toLocaleString()}`, subValue: 'Average rent per property' }
      ];

      const columns = ['Property Title', 'Category / Type', 'Price (PHP)', 'Status', 'Units', 'Key Highlights', 'Date Added'];
      const data = exportData.map(p => {
        const propType = (p as any).propertyType?.name 
          || (typeof (p as any).propertyType === 'string' ? (p as any).propertyType : null)
          || p.categories?.[0]?.category?.name 
          || 'N/A';

        // Dynamically extract real amenities/attributes from database relations
        const rawHighlights: string[] = [];

        // 1. From listingLinks (Attribute relation)
        if (Array.isArray((p as any).listingLinks)) {
          (p as any).listingLinks.forEach((link: any) => {
            const name = link?.attribute?.name || link?.name;
            if (name && typeof name === 'string' && !rawHighlights.includes(name)) {
              rawHighlights.push(name);
            }
          });
        }

        // 2. From amenities_list (String array)
        if (Array.isArray((p as any).amenities_list)) {
          (p as any).amenities_list.forEach((item: any) => {
            const name = typeof item === 'string' ? item : item?.name;
            if (name && typeof name === 'string' && !name.includes('|') && !rawHighlights.includes(name)) {
              rawHighlights.push(name);
            }
          });
        }

        // 3. From p.amenities
        if (Array.isArray(p.amenities)) {
          p.amenities.forEach((item: any) => {
            const name = typeof item === 'string' ? item : item?.name;
            if (name && typeof name === 'string' && !rawHighlights.includes(name)) {
              rawHighlights.push(name);
            }
          });
        }

        const highlights = rawHighlights.length > 0
          ? rawHighlights.slice(0, 3).join(', ')
          : 'None Specified';

        return [
          p.title,
          propType,
          p.price.toLocaleString(),
          (p.status || 'ACTIVE').toUpperCase(),
          `${p.roomCount || 0} Rooms`,
          highlights,
          new Date(p.createdAt).toLocaleDateString()
        ];
      });

      const totalsRow = [
        'TOTALS',
        `${totalListings} Properties`,
        `PHP ${totalValue.toLocaleString()}`,
        `${approvedCount} Active`,
        `${totalRooms} Rooms`,
        'All Checked',
        new Date().toLocaleDateString()
      ];

      const glossaryItems = [
        { term: 'Total Property Count', definition: 'Count of active boarding houses, transient houses, or apartments registered in your landlord portfolio.' },
        { term: 'Combined Base Rent', definition: 'Cumulative sum of base monthly rental prices across all listed properties.' },
        { term: 'Property Category', definition: 'Classification type of accommodation (e.g., Boarding House, Transient House, Apartment).' },
        { term: 'Listing Status', definition: 'Platform status — Active Listing (live for bookings), Pending Review (under admin audit), or Archived.' },
        { term: 'Shared Facilities & Amenities', definition: 'Building-wide facilities provided for residents (e.g., Fiber WiFi, Backup Generator, CCTV, Caretaker).' },
        { term: 'House Rules & Policies', definition: 'Resident guidelines regarding curfew, visitor policies, gender restrictions, and pets.' }
      ];

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Property_Portfolio_Report', columns, data, {
        title: 'Property Summary & Status Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Approval Status',
        categoryChartTitle: 'Property Types',
        trendChartTitle: 'Monthly Listings',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'property',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      responsiveToast.success({ title: 'SUCCESS', description: `Generated property report (${totalListings} items)` });
    } catch (error) {
      console.error('Failed to generate report:', error);
      responsiveToast.error({ title: 'ERROR', description: 'Failed to generate property report' });
    }
  };

  return {
    listings: paginatedListings,
    allListings: listings,
    filteredListings: filteredListings,
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
    isHeaderLoading: isInitialHeaderLoading,
    isSyncing: isQueryLoading || isFilterLoading,
    isLoading: isInitialHeaderLoading || isQueryLoading || isFilterLoading,
    searchQuery: searchInput,
    setSearchQuery: setSearchInput,
    handleConfirmDelete,
    handleLoadMore: () => { fetchNextPage() },
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive
  };
}

