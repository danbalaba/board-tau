'use client';

import React, { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Calendar, 
  History, 
  ArrowDownWideNarrow, 
  ArrowUpNarrowWide, 
  CheckCircle2, 
  LayoutGrid, 
  List,
  ChevronDown,
  Check,
  Plus,
  Building2,
  X,
  RotateCcw,
  Users,
  Settings2,
  Search,
  BedDouble,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useDebounce } from '@/hooks/use-debounce';
import { getCachedRoomTypes, getSyncRoomTypes } from '@/lib/landlordTaxonomyCache';

import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { LandlordRoomSearch } from './landlord-room-search';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';

interface LandlordRoomHeaderProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rooms: any[];
  onGenerateReport: () => Promise<void>;
  propertyFilter: string;
  setPropertyFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  capacityFilter: string;
  setCapacityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  uniqueProperties: { id: string; title: string }[];
  uniqueCapacities: number[];
  onClear: () => void;
  isArchived: boolean;
  onToggleArchived: () => void;
  onAddRoom: () => void;
}

export function LandlordRoomHeader({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  rooms,
  onGenerateReport,
  propertyFilter,
  setPropertyFilter,
  typeFilter,
  setTypeFilter,
  capacityFilter,
  setCapacityFilter,
  statusFilter,
  setStatusFilter,
  uniqueProperties,
  uniqueCapacities,
  onClear,
  isArchived,
  onToggleArchived,
  onAddRoom
}: LandlordRoomHeaderProps) {
  const isMobile = useIsMobile();
  const [propertySearch, setPropertySearch] = useState('');
  const debouncedPropertySearch = useDebounce(propertySearch, 250);
  const isFilteringProperty = propertySearch !== debouncedPropertySearch;
  
  // Dynamic Room Types taxonomy state
  const [roomTypeOptions, setRoomTypeOptions] = useState<{ id: string; name: string; label?: string }[]>([]);

  // Dropdown open states for animated arrow indicators
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [capacityDropdownOpen, setCapacityDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);

  // Mobile Drawer Draft Filter States
  const [draftProperty, setDraftProperty] = useState(propertyFilter);
  const [draftType, setDraftType] = useState(typeFilter);
  const [draftCapacity, setDraftCapacity] = useState(capacityFilter);
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);
  const [draftIsArchived, setDraftIsArchived] = useState(isArchived);

  const handleMobileSheetOpen = (open: boolean) => {
    if (open) {
      setDraftProperty(propertyFilter);
      setDraftType(typeFilter);
      setDraftCapacity(capacityFilter);
      setDraftStatus(statusFilter);
      setDraftSortBy(sortBy);
      setDraftIsArchived(isArchived);
    }
  };

  const handleApplyMobileFilters = () => {
    setPropertyFilter(draftProperty);
    setTypeFilter(draftType);
    setCapacityFilter(draftCapacity);
    setStatusFilter(draftStatus);
    setSortBy(draftSortBy);
    if (draftIsArchived !== isArchived) {
      onToggleArchived();
    }
  };

  const handleClearMobileFilters = () => {
    setDraftProperty('all');
    setDraftType('all');
    setDraftCapacity('all');
    setDraftStatus('all');
    setDraftSortBy('newest');
    setDraftIsArchived(false);
    setPropertyFilter('all');
    setTypeFilter('all');
    setCapacityFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
    if (isArchived) {
      onToggleArchived();
    }
    onClear();
  };

  // Load room types based on parent property type or landlord's active property types
  useEffect(() => {
    let isMounted = true;

    const loadRoomTypes = async () => {
      if (propertyFilter === 'all') {
        // If "All Properties" is selected, do NOT fetch room types. Reset options.
        if (isMounted) {
          setRoomTypeOptions([]);
          setIsLoadingRoomTypes(false);
          if (typeFilter !== 'all') {
            setTypeFilter('all');
          }
        }
        return;
      }

      // Specific property IS selected: show loader while fetching
      if (isMounted) {
        setIsLoadingRoomTypes(true);
      }

      try {
        const matchingRoom = rooms.find(
          (r) => r.propertyId === propertyFilter || r.listingId === propertyFilter || r.listing?.id === propertyFilter
        );
        const targetPropTypeId = matchingRoom?.propertyTypeId;

        if (targetPropTypeId) {
          const types = await getCachedRoomTypes(targetPropTypeId);
          if (isMounted && Array.isArray(types)) {
            setRoomTypeOptions(types);
          }
        } else {
          // Fallback: search room type definitions of matching property rooms
          const propRooms = rooms.filter(
            (r) => r.propertyId === propertyFilter || r.listingId === propertyFilter || r.listing?.id === propertyFilter
          );
          const uniqueMap = new Map<string, { id: string; name: string; label?: string }>();
          propRooms.forEach((r) => {
            const rtId = r.roomTypeDefinitionId || r.roomTypeDefinition?.id || r.roomType;
            const rtName = r.roomTypeDefinition?.name || r.roomTypeName || r.roomType;
            if (rtId && rtName) {
              const key = rtName.toLowerCase().trim();
              if (!uniqueMap.has(key)) {
                uniqueMap.set(key, { id: rtId, name: rtName, label: rtName });
              }
            }
          });
          if (isMounted) {
            setRoomTypeOptions(Array.from(uniqueMap.values()));
          }
        }
      } catch (err) {
        console.error('Error loading room types:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRoomTypes(false);
        }
      }
    };

    loadRoomTypes();

    return () => {
      isMounted = false;
    };
  }, [propertyFilter, rooms]);

  const handleGenerateCSV = async (dateRange?: DateRange) => {
    let exportData = rooms;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(r => {
        const createdAt = new Date(r.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'room');
    const totalCapacity = exportData.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const metadata = {
      reportTitle: 'Room Inventory Business Report',
      reportId: `BTAU-ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Room Inventory', value: `${exportData.length} Units` },
        { label: 'Total Capacity', value: `${totalCapacity} Pax` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Room_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async (dateRange?: DateRange) => {
    let exportData = rooms;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(r => {
        const createdAt = new Date(r.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'room');
    const totalCapacity = exportData.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const metadata = {
      reportTitle: 'Room Inventory Business Report',
      reportId: `BTAU-ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Room Inventory', value: `${exportData.length} Units` },
        { label: 'Total Capacity', value: `${totalCapacity} Pax` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Room_Report_${new Date().toLocaleDateString()}`, 'Rooms', metadata);
  };

  const filteredProperties = uniqueProperties.filter(p => 
    p.title.toLowerCase().includes(debouncedPropertySearch.toLowerCase())
  );

  const selectedTypeObj = roomTypeOptions.find(t => t.id === typeFilter || t.name === typeFilter);
  const typeDisplayLabel = typeFilter === 'all' 
    ? 'Room Type' 
    : (selectedTypeObj?.name || selectedTypeObj?.label || typeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 sm:p-8 rounded-[22px] sm:rounded-[3rem] border border-primary/10 shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl z-20"
    >
      {/* Premium Background Ambient Accents */}
      <div className="absolute inset-0 rounded-[22px] sm:rounded-[3rem] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-4 sm:gap-8">
        {/* TOP ROW: Title & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shrink-0">
              <DoorOpen className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Rooms
              </h1>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] sm:line-clamp-1">
                  Add rooms, set rates, and check room availability
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
            {/* View Mode Toggles */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300",
                    viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300",
                    viewMode === 'list' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <List size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Side-by-Side Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
              <GenerateReportButton 
                onGeneratePDF={onGenerateReport}
                onGenerateCSV={handleGenerateCSV}
                onGenerateExcel={handleGenerateExcel}
                label="Generate Report"
                outline={false}
                className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-xs border border-primary/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
              />

              <Button 
                onClick={onAddRoom}
                className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-md shadow-primary/20 border-b-2 sm:border-b-4 border-primary/30 active:border-b-0 transition-all flex items-center justify-center gap-1.5 group shrink-0"
              >
                <Plus size={14} className="sm:w-[16px] sm:h-[16px] group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
                <span className="truncate">Add Unit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-gray-100 dark:border-gray-800">
          {/* Search Bar & Mobile Filter Sheet Trigger */}
          <div className="flex items-center gap-2 w-full lg:max-w-md">
            <div className="flex-1">
              <LandlordRoomSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                rooms={rooms}
              />
            </div>

            {/* Mobile Bottom Sheet Drawer Trigger */}
            <LandlordMobileFilterSheet 
              activeFilterCount={
                (searchQuery.trim() !== '' ? 1 : 0) + 
                (propertyFilter !== 'all' ? 1 : 0) + 
                (typeFilter !== 'all' ? 1 : 0) + 
                (capacityFilter !== 'all' ? 1 : 0) + 
                (statusFilter !== 'all' ? 1 : 0) + 
                (isArchived ? 1 : 0)
              } 
              onClearAll={handleClearMobileFilters}
              onApply={handleApplyMobileFilters}
              onOpenChange={handleMobileSheetOpen}
            >
              {/* 1. Property Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Building2 size={13} className="text-primary" /> Property
                  </span>
                  {draftProperty !== 'all' && (
                    <button onClick={() => setDraftProperty('all')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-0.5">
                  <button
                    onClick={() => setDraftProperty('all')}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all",
                      draftProperty === 'all'
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-black"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                    )}
                  >
                    All Properties
                  </button>
                  {uniqueProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setDraftProperty(prop.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all",
                        draftProperty === prop.id
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      {prop.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Room Type Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <BedDouble size={13} className="text-primary" /> Room Type
                  </span>
                  {draftType !== 'all' && (
                    <button onClick={() => setDraftType('all')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Reset
                    </button>
                  )}
                </div>

                {draftProperty === 'all' ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Building2 size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        Select Property First
                      </p>
                      <p className="text-[10px] font-bold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-widest">
                        Tap a specific property above to view its available room types
                      </p>
                    </div>
                  </div>
                ) : isLoadingRoomTypes ? (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2.5 text-primary">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Fetching Room Types...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDraftType('all')}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all",
                        draftType === 'all'
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      All Types
                    </button>
                    {roomTypeOptions.map((tObj) => {
                      const tVal = tObj.id || tObj.name;
                      const isSelected = draftType === tVal || draftType === tObj.id || draftType === tObj.name;
                      return (
                        <button
                          key={tObj.id || tObj.name}
                          onClick={() => setDraftType(tVal)}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-black"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                          )}
                        >
                          {tObj.name || tObj.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Unit Status Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-primary" /> Unit Status
                  </span>
                  {draftStatus !== 'all' && (
                    <button onClick={() => setDraftStatus('all')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'AVAILABLE', label: 'Available' },
                    { value: 'FULL', label: 'Full' },
                    { value: 'MAINTENANCE', label: 'Maintenance' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftStatus(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between",
                        draftStatus === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftStatus === opt.value && <Check size={14} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Sort By Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ArrowDownWideNarrow size={13} className="text-primary" /> Sort By
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'price_desc', label: 'Highest Price' },
                    { value: 'price_asc', label: 'Lowest Price' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftSortBy(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between",
                        draftSortBy === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftSortBy === opt.value && <Check size={14} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Archived Section */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className={draftIsArchived ? "text-amber-500" : "text-gray-400"} />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                    Archived Mode
                  </span>
                </div>
                <button
                  onClick={() => setDraftIsArchived(!draftIsArchived)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all",
                    draftIsArchived
                      ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {draftIsArchived ? "Showing Archived" : "View Active"}
                </button>
              </div>
            </LandlordMobileFilterSheet>
          </div>

          {/* Desktop Filters Group */}
          <div className="hidden lg:flex items-center gap-2 lg:ml-auto">
            <div className="flex items-center gap-2 mr-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Settings2 size={14} />
              Filters
            </div>

            {/* 1. PROPERTY FILTER */}
            <DropdownMenu 
              open={propertyDropdownOpen}
              onOpenChange={(open) => {
                setPropertyDropdownOpen(open);
                if (!open) setPropertySearch('');
              }}
            >
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  propertyFilter !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", propertyFilter !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[100px] sm:max-w-[110px]">
                      {propertyFilter === 'all' ? 'All Properties' : uniqueProperties.find(p => p.id === propertyFilter)?.title}
                    </span>
                  </div>
                  {/* Modern Animated Arrow Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    propertyDropdownOpen
                      ? "bg-primary/20 text-primary rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-72 max-w-[calc(100vw-2rem)] max-h-[480px] overflow-hidden p-0 rounded-2xl shadow-2xl z-[150] bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                {/* Header with Title & Inside Clear Button */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property</span>
                  {propertyFilter !== 'all' && (
                    <button 
                      onClick={() => {
                        setPropertyFilter('all');
                        setPropertyDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>

                <div className="p-2.5 border-b border-gray-50 dark:border-gray-800" onKeyDown={(e) => e.stopPropagation()}>
                  <div className="relative group" onClick={(e) => e.stopPropagation()}>
                    {isFilteringProperty ? (
                      <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                    ) : (
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    )}
                    <input 
                      type="text"
                      placeholder="Find Property..."
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                      spellCheck={false}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary/20 rounded-xl py-2 pl-8 pr-7 text-xs font-bold outline-none transition-all placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest text-gray-900 dark:text-white"
                    />
                    {propertySearch && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertySearch('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar p-1.5 max-h-[300px] space-y-1">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => setPropertyFilter('all')} 
                      className={cn(
                        "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all",
                        propertyFilter === 'all' 
                          ? "bg-primary/10 text-primary font-black border border-primary/20" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <span>All Properties</span>
                      {propertyFilter === 'all' && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check size={12} className="text-primary" strokeWidth={3.5} />
                        </div>
                      )}
                    </DropdownMenuItem>
                    
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((prop) => {
                        const isSelected = propertyFilter === prop.id;
                        return (
                          <DropdownMenuItem 
                            key={prop.id} 
                            onClick={() => setPropertyFilter(prop.id)} 
                            className={cn(
                              "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                              isSelected 
                                ? "bg-primary/10 text-primary font-black border border-primary/20" 
                                : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Building2 size={13} className={cn("shrink-0", isSelected ? "text-primary" : "text-gray-400")} />
                              <span className="truncate font-black">{prop.title}</span> 
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                                <Check size={12} className="text-primary" strokeWidth={3.5} />
                              </div>
                            )}
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No properties found</p>
                      </div>
                    )}
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. DYNAMIC ROOM TYPE FILTER DROPDOWN */}
            <DropdownMenu 
              open={typeDropdownOpen}
              onOpenChange={(open) => setTypeDropdownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  typeFilter !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary",
                  propertyFilter === 'all' && "opacity-80"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    {isLoadingRoomTypes ? (
                      <Loader2 size={13} className="text-primary animate-spin shrink-0" />
                    ) : (
                      <BedDouble size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", typeFilter !== 'all' ? "text-primary" : "text-gray-400")} />
                    )}
                    <span className="truncate max-w-[90px] sm:max-w-[100px]">
                      {isLoadingRoomTypes ? 'Loading...' : propertyFilter === 'all' ? 'Select Property' : typeDisplayLabel}
                    </span>
                  </div>
                  {/* Modern Animated Arrow Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    typeDropdownOpen
                      ? "bg-primary/20 text-primary rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Room Type</span>
                  {typeFilter !== 'all' && (
                    <button 
                      onClick={() => {
                        setTypeFilter('all');
                        setTypeDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>

                {propertyFilter === 'all' ? (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-9 h-9 mx-auto rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      Select Property First
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      Please select a specific property to filter by room types.
                    </p>
                  </div>
                ) : isLoadingRoomTypes ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 size={20} className="mx-auto text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Fetching Room Types...
                    </p>
                  </div>
                ) : (
                  <div className="p-1.5 space-y-1 max-h-[280px] overflow-y-auto custom-scrollbar">
                    <DropdownMenuItem 
                      onClick={() => setTypeFilter('all')} 
                      className={cn(
                        "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all",
                        typeFilter === 'all' 
                          ? "bg-primary/10 text-primary font-black border border-primary/20" 
                          : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <span className="font-black">All Types</span>
                      {typeFilter === 'all' && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                          <Check size={12} className="text-primary" strokeWidth={3.5} />
                        </div>
                      )}
                    </DropdownMenuItem>

                    {roomTypeOptions.map((typeObj) => {
                      const typeVal = typeObj.id || typeObj.name;
                      const isSelected = typeFilter === typeVal || typeFilter === typeObj.id || typeFilter === typeObj.name;
                      return (
                        <DropdownMenuItem 
                          key={typeObj.id || typeObj.name} 
                          onClick={() => setTypeFilter(typeVal)} 
                          className={cn(
                            "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all",
                            isSelected 
                              ? "bg-primary/10 text-primary font-black border border-primary/20" 
                              : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <span className="font-black truncate">{typeObj.name || typeObj.label}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                              <Check size={12} className="text-primary" strokeWidth={3.5} />
                            </div>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. CAPACITY FILTER DROPDOWN */}
            <DropdownMenu 
              open={capacityDropdownOpen}
              onOpenChange={(open) => setCapacityDropdownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  capacityFilter !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Users size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", capacityFilter !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[90px] sm:max-w-[100px]">
                      {capacityFilter === 'all' ? 'Capacity' : `${capacityFilter} Pax`}
                    </span>
                  </div>
                  {/* Modern Animated Arrow Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    capacityDropdownOpen
                      ? "bg-primary/20 text-primary rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-52 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max Capacity</span>
                  {capacityFilter !== 'all' && (
                    <button 
                      onClick={() => {
                        setCapacityFilter('all');
                        setCapacityDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  <DropdownMenuItem 
                    onClick={() => setCapacityFilter('all')} 
                    className={cn(
                      "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all",
                      capacityFilter === 'all' 
                        ? "bg-primary/10 text-primary font-black border border-primary/20" 
                        : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span>All Capacities</span>
                    {capacityFilter === 'all' && (
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check size={12} className="text-primary" strokeWidth={3.5} />
                      </div>
                    )}
                  </DropdownMenuItem>
                  {uniqueCapacities.map((cap) => {
                    const isSelected = capacityFilter === cap.toString();
                    return (
                      <DropdownMenuItem 
                        key={cap} 
                        onClick={() => setCapacityFilter(cap.toString())} 
                        className={cn(
                          "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                          isSelected 
                            ? "bg-primary/10 text-primary font-black border border-primary/20" 
                            : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <span>{cap} {cap === 1 ? 'Person' : 'Persons'}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                            <Check size={12} className="text-primary" strokeWidth={3.5} />
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 4. ROOM STATUS FILTER DROPDOWN */}
            <DropdownMenu 
              open={statusDropdownOpen}
              onOpenChange={(open) => setStatusDropdownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  statusFilter !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", statusFilter !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[90px] sm:max-w-[100px]">
                      {statusFilter === 'all' 
                        ? 'Status' 
                        : statusFilter === 'AVAILABLE' ? 'Available'
                        : statusFilter === 'FULL' ? 'Full'
                        : statusFilter === 'MAINTENANCE' ? 'Maintenance'
                        : statusFilter}
                    </span>
                  </div>
                  {/* Modern Animated Arrow Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    statusDropdownOpen
                      ? "bg-primary/20 text-primary rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Status</span>
                  {statusFilter !== 'all' && (
                    <button 
                      onClick={() => {
                        setStatusFilter('all');
                        setStatusDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  {[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'AVAILABLE', label: 'Available' },
                    { value: 'FULL', label: 'Full' },
                    { value: 'MAINTENANCE', label: 'Maintenance' },
                  ].map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <DropdownMenuItem 
                        key={opt.value} 
                        onClick={() => setStatusFilter(opt.value)} 
                        className={cn(
                          "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all",
                          isSelected 
                            ? "bg-primary/10 text-primary font-black border border-primary/20" 
                            : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <span className="font-black">{opt.label}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                            <Check size={12} className="text-primary" strokeWidth={3.5} />
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 5. SORTING DROPDOWN */}
            <DropdownMenu 
              open={sortDropdownOpen}
              onOpenChange={(open) => setSortDropdownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <button className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm group">
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowDownWideNarrow size={13} className="shrink-0 text-gray-400 group-hover:text-primary transition-colors" />
                    <span className="max-w-[85px] truncate">
                      {[
                        { value: 'newest', label: 'Newest' },
                        { value: 'oldest', label: 'Oldest' },
                        { value: 'price_desc', label: 'High Price' },
                        { value: 'price_asc', label: 'Low Price' },
                      ].find(o => o.value === sortBy)?.label || 'Newest'}
                    </span>
                  </div>
                  {/* Modern Animated Arrow Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    sortDropdownOpen
                      ? "bg-primary/20 text-primary rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By</span>
                  {sortBy !== 'newest' && (
                    <button 
                      onClick={() => {
                        setSortBy('newest');
                        setSortDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  )}
                </div>

                <div className="p-1.5 space-y-1">
                  {[
                    { value: 'newest', label: 'Newest First', icon: History },
                    { value: 'oldest', label: 'Oldest First', icon: Calendar },
                    { value: 'price_desc', label: 'Highest Price', icon: ArrowDownWideNarrow },
                    { value: 'price_asc', label: 'Lowest Price', icon: ArrowUpNarrowWide },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = sortBy === option.value;
                    return (
                      <DropdownMenuItem 
                        key={option.value} 
                        onClick={() => setSortBy(option.value)} 
                        className={cn(
                          "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                          isSelected 
                            ? "bg-primary/10 text-primary font-black border border-primary/20" 
                            : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={14} className={isSelected ? "text-primary" : "text-gray-400"} />
                          <span className="font-black">{option.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                            <Check size={12} className="text-primary" strokeWidth={3.5} />
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 6. ARCHIVE VIEW TOGGLE BUTTON */}
            <button
              onClick={onToggleArchived}
              title={isArchived ? "Click to view active units" : "Click to view archived units"}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                isArchived 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20 font-black ring-2 ring-amber-500/20" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary font-black"
              )}
            >
              <RotateCcw size={13} className={cn("transition-transform duration-500 shrink-0", isArchived ? "rotate-180 text-amber-600" : "group-hover:-rotate-45")} />
              <span>{isArchived ? "Showing Archived" : "Archived"}</span>
              {isArchived && (
                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-wider">
                  View Active
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
