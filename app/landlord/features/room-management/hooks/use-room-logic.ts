'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

export interface Room {
  id: string;
  name: string;
  description?: string | null;
  propertyId?: string;
  propertyTitle?: string;
  price: number;
  capacity: number;
  availableSlots: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | string;
  roomType: string;
  bathroomArrangement?: string | null;
  bedType?: string;
  bedCount?: number;
  size?: number | null;
  reservationFee?: number;
  imageSrc?: string | null;
  images?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isArchived?: boolean;
  amenities?: any[];
}

const PAGE_SIZE = 12;

export function useRoomLogic(initialRooms: Room[], initialNextCursor: string | null) {
  const router = useRouter();
  const responsiveToast = useResponsiveToast();
  const { data: session } = useSession();
  const [rooms, setRooms] = useState(initialRooms);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // --- Unified Filter State (Reduces re-render cascades) ---
  const [filters, setFilters] = useState({
    property: 'all',
    type: 'all',
    capacity: 'all',
    status: 'all',
    isArchived: false,
    sortBy: 'newest',
    searchQuery: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Search with debounce ---
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: val }));
    }, 300);
  }, []);

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
    }, 700);
    return () => clearTimeout(timer);
  }, [filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const queryClient = useQueryClient();

  const fetchRooms = async ({ pageParam = null }: { pageParam: string | null }) => {
    const params = new URLSearchParams();
    if (pageParam) params.append('cursor', pageParam);
    if (filters.property !== 'all') params.append('listingId', filters.property);
    if (filters.type !== 'all') params.append('roomType', filters.type);
    if (filters.capacity !== 'all') params.append('capacity', filters.capacity);
    if (filters.status !== 'all') params.append('status', filters.status);
    params.append('isArchived', filters.isArchived ? 'true' : 'false');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.searchQuery) params.append('search', filters.searchQuery);

    const res = await fetch(`/api/landlord/rooms?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading
  } = useInfiniteQuery({
    queryKey: ['landlordRooms', filters],
    queryFn: fetchRooms,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
  });

  // Extract all rooms from infinite pages
  const roomsFromQuery = useMemo(() => {
    if (!data) return initialRooms; // Fallback to initial props before first fetch
    return data.pages.flatMap((page) => page.rooms || []);
  }, [data, initialRooms]);

  // Update local state when query data changes
  useEffect(() => {
    if (data) {
       setRooms(roomsFromQuery);
       setNextCursor(data.pages[data.pages.length - 1].nextCursor || null);
       setIsLoading(false);
    }
  }, [data, roomsFromQuery]);

  // Initial load spinner (page load only)
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for lifecycle management
  const isInitialMount = useRef(true);
  
  // Listen for redirection from property details or creator (Run once on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const propertyId = params.get('propertyId');
      const isNewListing = params.get('newListing') === 'true';
      const roomId = params.get('roomId');

      // 1. Handle auto-open for a specific room
      if (roomId) {
        const fetchAndOpenRoom = async () => {
          try {
            // Check if already in current rooms
            const existingRoom = rooms.find(r => r.id === roomId);
            if (existingRoom) {
              setSelectedRoom(existingRoom);
              setViewModalOpen(true);
            } else {
              // Fetch from API
              const safeRoomId = encodeURIComponent(roomId);
              const res = await fetch(`/api/landlord/rooms/${safeRoomId}`);
              const json = await res.json();
              if (json.success && json.room) {
                setSelectedRoom(json.room);
                setViewModalOpen(true);
              }
            }
          } catch (err) {
            console.error("Failed to auto-open room:", err);
          } finally {
            // Clean up URL
            router.replace('/landlord/rooms', { scroll: false });
          }
        };
        fetchAndOpenRoom();
      }

      // 2. Handle property creator redirection
      if (propertyId && isNewListing) {
        setFilters(prev => ({ ...prev, property: propertyId }));
        setAddModalOpen(true);
        router.replace('/landlord/rooms', { scroll: false });
      }
    }
  }, [router, rooms]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Sync state with server props
  useEffect(() => {
    if (!data) {
      setRooms(initialRooms);
      setNextCursor(initialNextCursor);
    }
  }, [initialRooms, initialNextCursor, data]);

  const [masterProperties, setMasterProperties] = useState<{ id: string; title: string }[]>([]);

  // Fetch all properties for dropdowns (independent of room pagination)
  useEffect(() => {
    const fetchMasterProperties = async () => {
      try {
        const res = await fetch('/api/landlord/properties?all=true');
        const json = await res.json();
        if (json.success) {
          setMasterProperties(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch master properties:", error);
      }
    };
    fetchMasterProperties();
  }, []);

  // Extract unique capacities for the capacity filter dropdown
  const uniqueCapacities = useMemo(() => {
    const capacities = rooms.reduce((acc: number[], room) => {
      if (room.capacity && !acc.includes(room.capacity)) {
        acc.push(room.capacity);
      }
      return acc;
    }, []);
    return capacities.sort((a, b) => a - b);
  }, [rooms]);

  // All matching rooms with local filter fallback
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => !!r.isArchived === filters.isArchived);
  }, [rooms, filters.isArchived]);

  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage, itemsPerPage]);

  const archiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const res = await fetch(`/api/landlord/rooms/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
      });
      if (!res.ok) throw new Error('Failed to update archive status');
      return { isArchived };
    },
    onSuccess: (mutationData) => {
      queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
      responsiveToast.success({ title: 'SUCCESS', description: mutationData.isArchived ? 'Room archived' : 'Room restored' });
      setArchiveModalOpen(false);
    },
    onError: () => {
      responsiveToast.error({ title: 'ERROR', description: 'Failed to update archive status' });
    }
  });

  const handleConfirmArchive = async () => {
    if (!selectedRoom) return;
    setIsArchiving(true);
    try {
      await archiveMutation.mutateAsync({ 
        id: selectedRoom.id, 
        isArchived: !(selectedRoom as any).isArchived 
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const hasMore = !!hasNextPage;
  const totalCount = filteredRooms.length; // Approximate local total

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/landlord/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete room');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
      responsiveToast.success({ title: 'SUCCESS', description: 'Room deleted successfully.' });
      setDeleteModalOpen(false);
    },
    onError: () => {
      responsiveToast.error({ title: 'ERROR', description: 'An unexpected error occurred during deletion.' });
      setDeleteModalOpen(false);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/landlord/rooms/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update room status');
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
      setRooms(prev => prev.map(r => r.id === data.id ? { ...r, status: data.status } : r));
      if (selectedRoom && selectedRoom.id === data.id) {
        setSelectedRoom(prev => prev ? { ...prev, status: data.status } : null);
      }
      responsiveToast.success({ title: 'SUCCESS', description: `Room status updated to ${data.status}` });
    },
    onError: () => {
      responsiveToast.error({ title: 'ERROR', description: 'Failed to update room status' });
    }
  });

  const handleStatusChange = useCallback(async (roomId: string, newStatus: string) => {
    await statusMutation.mutateAsync({ id: roomId, status: newStatus });
  }, [statusMutation]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRoom) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedRoom.id);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRoom, deleteMutation]);

  const refetchRooms = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
    queryClient.refetchQueries({ queryKey: ['landlordRooms'] });
  }, [queryClient]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      property: 'all',
      type: 'all',
      capacity: 'all',
      status: 'all',
      isArchived: false,
      sortBy: 'newest',
      searchQuery: ''
    });
    setSearchInput('');
  }, []);

  const handleGenerateReport = async (options?: { scope?: 'filtered' | 'all'; format?: string; includeSummary?: boolean; includeGlossary?: boolean; dateRange?: DateRange } | DateRange) => {
    try {
      const isParamDateRange = options && ('from' in options || 'to' in options);
      const dateRange = isParamDateRange ? (options as DateRange) : (options as any)?.dateRange;
      const exportScope = !isParamDateRange && (options as any)?.scope ? (options as any).scope : 'filtered';
      const includeSummary = !isParamDateRange && (options as any)?.includeSummary !== undefined ? (options as any).includeSummary : true;
      const includeGlossary = !isParamDateRange && (options as any)?.includeGlossary !== undefined ? (options as any).includeGlossary : true;

      let exportData = exportScope === 'all' ? rooms : filteredRooms;

      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter(r => {
          const createdAt = new Date(r.createdAt || 0);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalUnits = exportData.length;
      const totalCapacity = exportData.reduce((acc, r) => acc + (r.capacity || 0), 0);
      const totalPrice = exportData.reduce((acc, r) => acc + (r.price || 0), 0);
      const avgPrice = totalUnits > 0 ? totalPrice / totalUnits : 0;

      // Status Distribution Data for Bar Graph
      const availableCount = exportData.filter(r => (r.status || '').toLowerCase() === 'available').length;
      const fullCount = exportData.filter(r => (r.status || '').toLowerCase() === 'full').length;
      const maintCount = exportData.filter(r => (r.status || '').toLowerCase() === 'maintenance').length;

      const distributionData = [
        { label: 'Available Units', count: availableCount, percentage: totalUnits ? (availableCount / totalUnits) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: 'Full Capacity', count: fullCount, percentage: totalUnits ? (fullCount / totalUnits) * 100 : 0, color: [37, 99, 235] as [number, number, number] },
        { label: 'Under Maintenance', count: maintCount, percentage: totalUnits ? (maintCount / totalUnits) * 100 : 0, color: [217, 119, 6] as [number, number, number] }
      ];

      const getRoomTypeName = (r: Room) => {
        const rawName = (r as any).roomTypeDefinition?.name || 
                        (r as any).roomTypeName || 
                        (r.roomType && !/^[0-9a-fA-F]{24}$/.test(r.roomType) ? r.roomType : null);
        return rawName || 'Standard Room';
      };

      // Room Type Breakdown for Horizontal Bar Chart Graph
      const typeCounts: Record<string, number> = {};
      exportData.forEach(r => {
        const typeName = getRoomTypeName(r);
        typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
      });

      const categoryData = Object.entries(typeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      // Monthly Unit Creation Trajectory for Line Graph
      const monthCounts: Record<string, number> = {};
      exportData.forEach(r => {
        const date = new Date(r.createdAt || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const summaryData = [
        { label: 'Total Rooms', value: `${totalUnits} Rooms`, subValue: `${availableCount} Vacant | ${fullCount} Full` },
        { label: 'Total Capacity', value: `${totalCapacity} Guests`, subValue: 'Maximum guest capacity' },
        { label: 'Total Monthly Rent', value: `PHP ${totalPrice.toLocaleString()}`, subValue: 'Combined room rent' },
        { label: 'Avg Room Price', value: `PHP ${Math.round(avgPrice).toLocaleString()}`, subValue: 'Average price per room' }
      ];

      const columns = ['Room Name', 'Property Title', 'Room Type', 'Price (PHP)', 'Capacity', 'Status'];
      const data = exportData.map(r => [
        r.name,
        r.propertyTitle || 'N/A',
        getRoomTypeName(r),
        r.price.toLocaleString(),
        `${r.capacity || 1} Guests`,
        (r.status || 'AVAILABLE').toUpperCase()
      ]);

      const totalsRow = [
        'TOTALS',
        `${totalUnits} Rooms`,
        '-',
        `PHP ${totalPrice.toLocaleString()}`,
        `${totalCapacity} Guests`,
        `${availableCount} Vacant`
      ];

      const glossaryItems = [
        { term: 'Total Room Units', definition: 'Count of individual rental units and rooms registered under your properties.' },
        { term: 'Room Occupancy & Vacancy', definition: 'Current availability state — Vacant (ready for move-in), Fully Occupied, or Under Maintenance.' },
        { term: 'Maximum Capacity', definition: 'Maximum number of tenant occupants permitted for the room unit.' },
        { term: 'Monthly Rental Rate', definition: 'Agreed monthly rental fee charged per occupant or per room unit.' },
        { term: 'Reservation Hold Fee', definition: 'Advance deposit required from prospective tenants to lock and reserve a room slot before check-in.' },
        { term: 'Bathroom Setup', definition: 'Sanitation facility arrangement — Private Bathroom (inside unit) or Shared CR (communal facility).' },
        { term: 'In-Unit Amenities', definition: 'Dedicated appliances and features inside the room (e.g., Aircon, Storage Closet, Study Desk, Hot Shower).' }
      ];

      const subtitle = exportScope === 'all'
        ? `All-Time Room Inventory for ${totalUnits} rooms (${availableCount} Vacant, ${fullCount} Full, ${maintCount} Maintenance)`
        : `Filtered Room Report for ${totalUnits} rooms`;

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Room_Inventory_Report', columns, data, {
        title: 'Room & Unit Summary Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Room Availability',
        categoryChartTitle: 'Room Types',
        trendChartTitle: 'Monthly Room Additions',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'room',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      
      responsiveToast.success({ title: 'SUCCESS', description: `Generated room report for ${totalUnits} rooms` });
    } catch (error) {
      console.error('Failed to generate report:', error);
      responsiveToast.error({ title: 'ERROR', description: 'Failed to generate room report' });
    }
  };

  return {
    // Room data
    rooms: paginatedRooms,
    allRooms: rooms,
    allFilteredRooms: filteredRooms,
    totalCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    // Modals
    deleteModalOpen,
    setDeleteModalOpen,
    viewModalOpen,
    setViewModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    addModalOpen,
    setAddModalOpen,
    selectedRoom,
    setSelectedRoom,
    isDeleting,
    isArchiving,
    // Sort & View
    sortBy: filters.sortBy,
    setSortBy: (val: string) => setFilters(prev => ({ ...prev, sortBy: val })),
    viewMode,
    setViewMode,
    // Search (debounced)
    searchQuery: searchInput, // expose input value for controlled input
    setSearchQuery: handleSearchInput,
    // Filters
    propertyFilter: filters.property,
    setPropertyFilter: (val: string) => setFilters(prev => ({ ...prev, property: val })),
    typeFilter: filters.type,
    setTypeFilter: (val: string) => setFilters(prev => ({ ...prev, type: val })),
    capacityFilter: filters.capacity,
    setCapacityFilter: (val: string) => setFilters(prev => ({ ...prev, capacity: val })),
    statusFilter: filters.status,
    setStatusFilter: (val: string) => setFilters(prev => ({ ...prev, status: val })),
    isArchived: filters.isArchived,
    setIsArchived: (val: boolean) => setFilters(prev => ({ ...prev, isArchived: val })),
    uniqueProperties: masterProperties,
    uniqueCapacities,
    // Pagination
    hasMore,
    isLoadingMore: isFetchingNextPage,
    handleLoadMore,
    // Status
    isHeaderLoading: isLoading,
    isSyncing: isQueryLoading || isFilterLoading,
    isLoading: isLoading || isQueryLoading || isFilterLoading,
    // Actions
    handleConfirmDelete,
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive,
    handleStatusChange,
    refetchRooms,
  };
}
