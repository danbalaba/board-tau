'use client';

import React from 'react';
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
  FileDown,
  Building2,
  X,
  RotateCcw,
  Users,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';

import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { LandlordRoomSearch } from './landlord-room-search';
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
  uniqueProperties,
  uniqueCapacities,
  onClear,
  isArchived,
  onToggleArchived,
  onAddRoom
}: LandlordRoomHeaderProps) {
  const hasActiveFilters = searchQuery.trim() !== '' || propertyFilter !== 'all' || typeFilter !== 'all' || capacityFilter !== 'all';

  const handleGenerateCSV = async () => {
    const reportData = prepareDataForExport(rooms, 'room');
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const metadata = {
      reportTitle: 'Room Inventory Business Report',
      reportId: `BTAU-ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Room Inventory', value: `${rooms.length} Units` },
        { label: 'Total Capacity', value: `${totalCapacity} Pax` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Room_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async () => {
    const reportData = prepareDataForExport(rooms, 'room');
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const metadata = {
      reportTitle: 'Room Inventory Business Report',
      reportId: `BTAU-ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Room Inventory', value: `${rooms.length} Units` },
        { label: 'Total Capacity', value: `${totalCapacity} Pax` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Room_Report_${new Date().toLocaleDateString()}`, 'Rooms', metadata);
  };

  const [propertySearch, setPropertySearch] = React.useState('');
  const filteredProperties = uniqueProperties.filter(p => 
    p.title.toLowerCase().includes(propertySearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      {/* Premium Background Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8">
        {/* TOP ROW: Title & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700">
              <DoorOpen size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Rooms
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Manage Inventory & Occupancy
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* View Toggles */}
            <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <List size={18} />
              </button>
            </div>

            <GenerateReportButton 
              onGeneratePDF={onGenerateReport}
              onGenerateCSV={handleGenerateCSV}
              onGenerateExcel={handleGenerateExcel}
              label="Generate Report"
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2"
            />

            <Button 
              onClick={onAddRoom}
              className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 border-b-4 border-primary/30 active:border-b-0 transition-all group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[11px] font-black uppercase tracking-widest ml-2">Add Unit</span>
            </Button>
          </div>
        </div>

        {/* BOTTOM ROW: Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          {/* Search - Expands to take space */}
          <div className="flex-1 lg:max-w-md">
            <LandlordRoomSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              rooms={rooms}
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <div className="flex items-center gap-2 mr-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Settings2 size={14} />
              Filters
            </div>

            {/* Property Filter */}
            <DropdownMenu onOpenChange={(open) => !open && setPropertySearch('')}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm group">
                  <Building2 size={14} className="group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[100px]">
                    {propertyFilter === 'all' ? 'All Properties' : uniqueProperties.find(p => p.id === propertyFilter)?.title}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-[500px] overflow-hidden p-0 rounded-[2rem] shadow-2xl z-[150] bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="p-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Settings2 size={12} className="group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Find Property..."
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary/20 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none transition-all placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar p-2 max-h-[350px]">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => setPropertyFilter('all')} 
                      className={cn("cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", propertyFilter === 'all' ? "bg-primary/10 text-primary" : "text-gray-500")}
                    >
                      All Properties {propertyFilter === 'all' && <Check size={14} className="ml-auto" />}
                    </DropdownMenuItem>
                    
                    <div className="h-px bg-gray-50 dark:bg-gray-800 my-2 mx-2" />

                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((prop) => (
                        <DropdownMenuItem 
                          key={prop.id} 
                          onClick={() => setPropertyFilter(prop.id)} 
                          className={cn("cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", propertyFilter === prop.id ? "bg-primary/10 text-primary" : "text-gray-500")}
                        >
                          <Building2 size={14} className={cn("shrink-0", propertyFilter === prop.id ? "text-primary" : "text-gray-400")} />
                          <span className="truncate">{prop.title}</span> 
                          {propertyFilter === prop.id && <Check size={14} className="ml-auto shrink-0" />}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="py-8 px-4 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">No properties found</p>
                      </div>
                    )}
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
                  <LayoutGrid size={14} />
                  <span>{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b mb-1">Room Type</div>
                {['all', 'SOLO', 'BEDSPACE'].map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)} className={cn("cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase", typeFilter === type && "bg-primary/10 text-primary")}>
                    {type === 'all' ? 'All Types' : type} {typeFilter === type && <Check size={14} className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Capacity Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
                  <Users size={14} />
                  <span>{capacityFilter === 'all' ? 'All Capacities' : `${capacityFilter} Pax`}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b mb-1">Max Capacity</div>
                <DropdownMenuItem onClick={() => setCapacityFilter('all')} className={cn("cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold", capacityFilter === 'all' && "bg-primary/10 text-primary")}>
                  All Capacities {capacityFilter === 'all' && <Check size={14} className="ml-auto" />}
                </DropdownMenuItem>
                {uniqueCapacities.map((cap) => (
                  <DropdownMenuItem key={cap} onClick={() => setCapacityFilter(cap.toString())} className={cn("cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold", capacityFilter === cap.toString() && "bg-primary/10 text-primary")}>
                    {cap} {cap === 1 ? 'Person' : 'Persons'} {capacityFilter === cap.toString() && <Check size={14} className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sorting */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
                  <ArrowDownWideNarrow size={14} />
                  <span className="max-w-[80px] truncate">{[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'price_desc', label: 'High Price' },
                    { value: 'price_asc', label: 'Low Price' },
                    { value: 'status', label: 'Status' },
                  ].find(o => o.value === sortBy)?.label || 'Newest'}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b mb-1">Sort By</div>
                {[
                  { value: 'newest', label: 'Newest First', icon: History },
                  { value: 'oldest', label: 'Oldest First', icon: Calendar },
                  { value: 'price_desc', label: 'Highest Price', icon: ArrowDownWideNarrow },
                  { value: 'price_asc', label: 'Lowest Price', icon: ArrowUpNarrowWide },
                  { value: 'status', label: 'Unit Status', icon: CheckCircle2 },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = sortBy === option.value;
                  return (
                    <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)} className={cn("cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold", isSelected && "bg-primary/10 text-primary")}>
                      <Icon size={16} className={cn(isSelected ? "text-primary" : "text-gray-400")} />
                      {option.label} {isSelected && <Check size={14} className="ml-auto" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Archive Toggle */}
            <button
              onClick={onToggleArchived}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                isArchived 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary"
              )}
            >
              <RotateCcw size={14} className={cn("transition-transform duration-500", isArchived ? "rotate-180" : "group-hover:-rotate-45")} />
              <span>{isArchived ? "Viewing Archived" : "View Archived"}</span>
            </button>

            {/* Clear Filters Button */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  onClick={onClear}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl border border-rose-100 dark:border-rose-500/20 transition-all shadow-sm group shrink-0"
                >
                  <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
