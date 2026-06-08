'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Room {
  id: string;
  name: string;
  description?: string | null;
  propertyId: string;
  propertyTitle: string;
  price: number;
  capacity: number;
  availableSlots: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  roomType: 'SOLO' | 'BEDSPACE';
  bathroomArrangement?: string | null;
  bedType?: string;
  bedCount: number;
  size?: number | null;
  reservationFee: number;
  imageSrc?: string | null;
  images: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  isArchived: boolean;
  amenities?: any[];
}

const PAGE_SIZE = 12;

export function useRoomLogic(initialRooms: Room[], initialNextCursor: string | null) {
  const router = useRouter();
  const responsiveToast = useResponsiveToast();
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
    isArchived: false,
    sortBy: 'newest',
    searchQuery: ''
  });

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

  const queryClient = useQueryClient();

  const fetchRooms = async ({ pageParam = null }: { pageParam: string | null }) => {
    const params = new URLSearchParams();
    if (pageParam) params.append('cursor', pageParam);
    if (filters.property !== 'all') params.append('listingId', filters.property);
    if (filters.type !== 'all') params.append('roomType', filters.type);
    if (filters.capacity !== 'all') params.append('capacity', filters.capacity);
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
              const res = await fetch(`/api/landlord/rooms/${roomId}`);
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
    const t = setTimeout(() => setIsLoading(false), 700);
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
  const totalCount = rooms.length; // Approximate local total

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

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRoom) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedRoom.id);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRoom, deleteMutation]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      property: 'all',
      type: 'all',
      capacity: 'all',
      isArchived: false,
      sortBy: 'newest',
      searchQuery: ''
    });
    setSearchInput('');
  }, []);

  const handleGenerateReport = async () => {
    try {
      const result = filteredRooms;
      const totalUnits = result.length;
      const totalCapacity = result.reduce((acc, r) => acc + (r.capacity || 0), 0);
      const avgPrice = result.length > 0 ? result.reduce((acc, r) => acc + r.price, 0) / result.length : 0;

      const summaryData = [
        { 
          label: 'Room Inventory', 
          value: `${totalUnits} Units`,
          subValue: 'Total managed'
        },
        { 
          label: 'Total Capacity', 
          value: `${totalCapacity} Pax`,
          subValue: 'Max occupancy'
        },
        { 
          label: 'Avg Rate', 
          value: `PHP ${Math.round(avgPrice).toLocaleString()}`,
          subValue: 'Per room/bed'
        }
      ];

      const columns = ['Room Name', 'Property', 'Type', 'Price (PHP)', 'Capacity', 'Status'];
      const data = result.map(r => [
        r.name,
        r.propertyTitle,
        r.roomType,
        r.price.toLocaleString(),
        r.capacity.toString(),
        r.status
      ]);

      await generateTablePDF('Rooms_Report', columns, data, {
        title: 'Room Inventory Report',
        subtitle: `Detailed auditing for ${totalUnits} active room listings`,
        author: 'Landlord Management System',
        summaryData: summaryData
      });
      
      responsiveToast.success({ title: 'SUCCESS', description: `Generated enterprise report for ${totalUnits} rooms` });
    } catch (error) {
      console.error('Failed to generate report:', error);
      responsiveToast.error({ title: 'ERROR', description: 'Failed to generate complete report' });
    }
  };

  return {
    // Room data
    rooms: filteredRooms,
    totalCount,
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
    isArchived: filters.isArchived,
    setIsArchived: (val: boolean) => setFilters(prev => ({ ...prev, isArchived: val })),
    uniqueProperties: masterProperties,
    uniqueCapacities,
    // Pagination
    hasMore,
    isLoadingMore: isFetchingNextPage,
    handleLoadMore,
    // Status
    isLoading,
    // Actions
    handleConfirmDelete,
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive,
  };
}
