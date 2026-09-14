'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import {
  IconBuilding,
  IconUser,
  IconMessage2,
  IconCalendarCheck,
  IconChevronRight,
  IconPlus,
  IconPencil,
  IconBed,
  IconStar,
  IconChartBar,
  IconGripVertical,
  IconClock,
  IconUsers,
  IconMessages,
  IconMinus,
  IconCheck,
  IconTrash,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';

import Skeleton from '@/components/common/Skeleton';
import { useLoading } from '@/components/loading/LoadingContext';

export interface QuickActionPreset {
  key: string;
  title: string;
  fullTitle: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  href: string;
  description: string;
  badgeColor: string;
}

const ALL_PRESETS: QuickActionPreset[] = [
  {
    key: 'properties',
    title: 'Properties',
    fullTitle: 'Manage Properties',
    icon: IconBuilding,
    href: '/landlord/properties',
    description: 'View & manage listed properties',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20',
  },
  {
    key: 'inquiries',
    title: 'Inquiries',
    fullTitle: 'Tenant Inquiries',
    icon: IconMessage2,
    href: '/landlord/inquiries',
    description: 'Check incoming tenant questions',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20',
  },
  {
    key: 'bookings',
    title: 'Bookings',
    fullTitle: 'Manage Bookings',
    icon: IconCalendarCheck,
    href: '/landlord/bookings',
    description: 'Active leases & tenant bookings',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20',
  },
  {
    key: 'rooms',
    title: 'Rooms',
    fullTitle: 'Room Inventory',
    icon: IconBed,
    href: '/landlord/rooms',
    description: 'Track room availability & units',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20',
  },
  {
    key: 'reservations',
    title: 'Reservations',
    fullTitle: 'Pending Requests',
    icon: IconClock,
    href: '/landlord/reservations',
    description: 'Review pending tenant reservations',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20',
  },
  {
    key: 'messages',
    title: 'Messages',
    fullTitle: 'Messaging Hub',
    icon: IconMessages,
    href: '/landlord/messages',
    description: 'Direct messages with tenants',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20',
  },
  {
    key: 'tenants',
    title: 'Tenants',
    fullTitle: 'Tenant Directory',
    icon: IconUsers,
    href: '/landlord/tenants',
    description: 'View current & past occupants',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20',
  },
  {
    key: 'reviews',
    title: 'Reviews',
    fullTitle: 'Tenant Reviews',
    icon: IconStar,
    href: '/landlord/reviews',
    description: 'Check ratings & feedback',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    fullTitle: 'Financial Analytics',
    icon: IconChartBar,
    href: '/landlord/analytics',
    description: 'Revenue, occupancy & charts',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20',
  },
  {
    key: 'profile',
    title: 'Profile',
    fullTitle: 'Landlord Profile',
    icon: IconUser,
    href: '#',
    description: 'Account details & settings',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20',
  },
  {
    key: 'create_property',
    title: 'Add Property',
    fullTitle: 'Add New Property',
    icon: IconPlus,
    href: '/landlord/properties/create',
    description: 'List a new rental property',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20',
  },
];

const DEFAULT_KEYS = ['properties', 'profile', 'inquiries', 'bookings'];

// Sub-component for each draggable active shortcut item with controlled handle dragging
function DraggableShortcutItem({
  preset,
  onRemove,
}: {
  preset: QuickActionPreset;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const Icon = preset.icon;

  return (
    <Reorder.Item
      value={preset.key}
      dragListener={false}
      dragControls={controls}
      className="group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-emerald-500/30 dark:border-emerald-500/40 text-gray-900 dark:text-white shadow-xs select-none"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {/* Grip handle - dragListener={false} ensures drag only starts on pointer down here */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="p-1 -ml-1 text-gray-400 hover:text-[#2f7d6d] dark:hover:text-emerald-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          title="Drag handle to reorder"
        >
          <IconGripVertical size={20} />
        </div>

        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${preset.badgeColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1 pr-1">
          <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate leading-snug">
            {preset.fullTitle}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {preset.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0 ml-1"
        title="Remove shortcut"
      >
        <IconMinus size={16} strokeWidth={2.5} />
      </button>
    </Reorder.Item>
  );
}

export function LandlordDashboardQuickActions({
  onViewProfile,
  isLoading,
}: {
  onViewProfile: () => void;
  isLoading?: boolean;
}) {
  const { startLoading } = useLoading();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(DEFAULT_KEYS);
  const [draftKeys, setDraftKeys] = useState<string[]>(DEFAULT_KEYS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const modalDragControls = useDragControls();

  useEffect(() => {
    setMounted(true);
    // 1. Instant local read (0ms response)
    try {
      const saved = localStorage.getItem('boardtau_landlord_quick_actions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedKeys(parsed);
          setDraftKeys(parsed);
        }
      }
    } catch (e) {
      // Ignore storage errors
    }

    // 2. Background async sync with server DB & Redis cache
    fetch('/api/landlord/preferences/quick-actions')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setSelectedKeys(resData.data);
          setDraftKeys(resData.data);
          try {
            localStorage.setItem('boardtau_landlord_quick_actions', JSON.stringify(resData.data));
          } catch (e) {}
        }
      })
      .catch(() => {
        // Fallback silently to localStorage
      });
  }, []);

  const handleOpenModal = () => {
    setDraftKeys([...selectedKeys]);
    setShowMaxWarning(false);
    setIsModalOpen(true);
  };

  const savePreferences = () => {
    // 1. Instant UI update & localStorage save (0ms response for user)
    setSelectedKeys(draftKeys);
    try {
      localStorage.setItem('boardtau_landlord_quick_actions', JSON.stringify(draftKeys));
    } catch (e) {
      // Ignore storage errors
    }
    setIsModalOpen(false);

    // 2. Asynchronous fire-and-forget DB & Redis update
    fetch('/api/landlord/preferences/quick-actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quickActions: draftKeys }),
    }).catch((err) => {
      console.error('Failed to sync quick actions to backend:', err);
    });
  };

  const removeDraftKey = (key: string) => {
    setDraftKeys(draftKeys.filter((k) => k !== key));
    setShowMaxWarning(false);
  };

  const clearAllDraftKeys = () => {
    setDraftKeys([]);
    setShowMaxWarning(false);
  };

  const addDraftKey = (key: string) => {
    if (draftKeys.includes(key)) return;
    if (draftKeys.length >= 4) {
      setShowMaxWarning(true);
      toast.error('Maximum 4 shortcuts reached. Remove an active shortcut first.', {
        id: 'max-shortcuts-limit',
      });
      return;
    }
    setDraftKeys([...draftKeys, key]);
    setShowMaxWarning(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs"
          >
            <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-20 sm:w-24" variant="text" />
              <Skeleton className="h-3 w-28 opacity-60" variant="text" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Dashboard active actions (only committed selectedKeys)
  const activeActions = selectedKeys
    .map((key) => ALL_PRESETS.find((p) => p.key === key))
    .filter(Boolean) as QuickActionPreset[];

  // Modal draft available presets
  const availablePresets = ALL_PRESETS.filter((p) => !draftKeys.includes(p.key));

  return (
    <div className="space-y-2.5">
      {/* Header bar with Pencil Edit Icon */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
            Quick actions
          </h2>
          <button
            type="button"
            onClick={handleOpenModal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2f7d6d] dark:hover:text-emerald-400 hover:bg-[#2f7d6d]/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Drag & customize quick actions"
          >
            <IconPencil size={15} strokeWidth={2.2} />
          </button>
        </div>

        <Link
          href="/landlord/properties/create"
          className="text-[11px] font-extrabold text-[#2f7d6d] dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
          onClick={() => { if (startLoading) startLoading(); }}
        >
          <IconPlus size={14} strokeWidth={3} />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Empty State on Dashboard if all shortcuts are removed */}
      {activeActions.length === 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            No quick action shortcuts selected.
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            + Add Shortcuts
          </button>
        </div>
      )}

      {/* Mobile Tile Layout (4 Columns) */}
      {activeActions.length > 0 && (
        <div className="block sm:hidden">
          <div className="grid grid-cols-4 gap-2">
            {activeActions.map((action) => {
              const Icon = action.icon;
              const isProfile = action.key === 'profile';
              const TileContent = (
                <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-full">
                  <div className={`w-14 h-14 rounded-2xl ${action.badgeColor} group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-active:scale-95 border border-gray-100 dark:border-gray-800`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors text-center truncate w-full">
                    {action.title}
                  </span>
                </div>
              );

              if (isProfile) {
                return (
                  <button key={action.key} onClick={onViewProfile} className="w-full">
                    {TileContent}
                  </button>
                );
              }

              return (
                <Link 
                  key={action.key} 
                  href={action.href} 
                  className="w-full"
                  onClick={() => { if (startLoading) startLoading(); }}
                >
                  {TileContent}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop / Tablet Quick Actions (Horizontal Grid Row Layout) */}
      {activeActions.length > 0 && (
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {activeActions.map((action) => {
            const Icon = action.icon;
            const isProfile = action.key === 'profile';
            const CardContent = (
              <div className="flex items-center gap-3 w-full">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${action.badgeColor} group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-xs`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                    {action.fullTitle}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 truncate">
                    {action.description}
                  </p>
                </div>
                <IconChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 hidden lg:block" />
              </div>
            );

            if (isProfile) {
              return (
                <button
                  key={action.key}
                  onClick={onViewProfile}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-3.5 sm:p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 w-full text-left cursor-pointer"
                >
                  {CardContent}
                </button>
              );
            }

            return (
              <Link
                key={action.key}
                href={action.href}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-3.5 sm:p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 block"
                onClick={() => { if (startLoading) startLoading(); }}
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      )}

      {/* Customize Quick Actions Modal (Portal + Drag top handle line to close) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Fullscreen Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                />

                {/* Modal Container with Drag Down restricted to Top Handle Line */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 60, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  drag="y"
                  dragListener={false}
                  dragControls={modalDragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 400) {
                      setIsModalOpen(false);
                    }
                  }}
                  className="relative w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] flex flex-col z-10 overflow-hidden"
                >
                  {/* Top Line Grab Handle Bar (Mobile Only) */}
                  <div
                    onPointerDown={(e) => modalDragControls.start(e)}
                    className="w-full pt-1 pb-3 cursor-grab active:cursor-grabbing flex sm:hidden items-center justify-center shrink-0 touch-none"
                    title="Drag down to close modal"
                  >
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors" />
                  </div>

                  {/* Modal Header */}
                  <div className="pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                          Customize Quick Actions
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 rounded-full">
                          Drag & Drop
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                        <span className="hidden sm:inline">Drag the handle icon on any item to reorder, then click Save Preferences.</span>
                        <span className="inline sm:hidden">Drag handle to reorder shortcuts, or swipe down to exit.</span>
                      </p>
                    </div>

                    {/* Desktop Close (X) Button */}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="hidden sm:flex p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer shrink-0"
                      title="Close modal"
                    >
                      <IconX size={20} />
                    </button>
                  </div>

                  {/* Content Container (Clean layout without visible right scrollbar) */}
                  <div className="py-3.5 space-y-4 overflow-y-auto flex-1 pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Section 1: Active Shortcuts (Draggable) */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <h4 className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                          Active Shortcuts ({draftKeys.length}/4)
                        </h4>
                        <div className="flex items-center gap-3">
                          {draftKeys.length > 0 && (
                            <button
                              type="button"
                              onClick={clearAllDraftKeys}
                              className="text-[11px] font-extrabold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                              title="Remove all active shortcuts"
                            >
                              <IconTrash size={13} />
                              <span>Remove all</span>
                            </button>
                          )}
                          <span className="text-[11px] font-extrabold text-[#2f7d6d] dark:text-emerald-400">
                            Drag handle to reorder
                          </span>
                        </div>
                      </div>

                      {/* Empty state inside modal if all active shortcuts removed */}
                      {draftKeys.length === 0 ? (
                        <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center py-6">
                          <p className="text-xs font-extrabold text-gray-600 dark:text-gray-300">
                            No shortcuts active
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                            Tap '+' on any available shortcut below to add up to 4 shortcuts.
                          </p>
                        </div>
                      ) : (
                        /* Framer Motion Reorder Group for Drag and Drop */
                        <Reorder.Group
                          axis="y"
                          values={draftKeys}
                          onReorder={setDraftKeys}
                          className="space-y-2"
                        >
                          {draftKeys.map((key) => {
                            const preset = ALL_PRESETS.find((p) => p.key === key);
                            if (!preset) return null;

                            return (
                              <DraggableShortcutItem
                                key={preset.key}
                                preset={preset}
                                onRemove={() => removeDraftKey(preset.key)}
                              />
                            );
                          })}
                        </Reorder.Group>
                      )}
                    </div>

                    {/* Section 2: Available Quick Actions */}
                    {availablePresets.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <h4 className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                            More Available Landlord Shortcuts
                          </h4>
                          {draftKeys.length >= 4 && (
                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
                              Max 4 Reached
                            </span>
                          )}
                        </div>

                        {/* Animated Max Limit Warning Banner */}
                        {draftKeys.length >= 4 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center gap-2 text-xs font-bold"
                          >
                            <IconAlertCircle size={17} className="shrink-0 text-amber-500" />
                            <span className="leading-snug">
                              Maximum 4 active shortcuts allowed. Remove a shortcut above to add another.
                            </span>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availablePresets.map((preset) => {
                            const Icon = preset.icon;

                            return (
                              <div
                                key={preset.key}
                                onClick={() => addDraftKey(preset.key)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group select-none ${
                                  draftKeys.length >= 4
                                    ? 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800/60 opacity-60 hover:opacity-100 hover:border-amber-400/50'
                                    : 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className={`w-9 h-9 rounded-xl ${preset.badgeColor} flex items-center justify-center shrink-0`}>
                                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                                  </div>
                                  <div className="min-w-0 flex-1 pr-1">
                                    <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate leading-snug">
                                      {preset.fullTitle}
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-400 truncate mt-0.5">
                                      {preset.description}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ml-1 ${
                                    draftKeys.length >= 4
                                      ? 'bg-gray-200/50 dark:bg-gray-700/40 text-gray-400 group-hover:bg-amber-500 group-hover:text-white'
                                      : 'bg-gray-200/70 dark:bg-gray-700/60 group-hover:bg-[#2f7d6d] group-hover:text-white text-gray-600 dark:text-gray-300'
                                  }`}
                                  title={draftKeys.length >= 4 ? 'Max 4 shortcuts limit reached' : 'Add to quick actions'}
                                >
                                  <IconPlus size={15} strokeWidth={2.5} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer CTA */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    <button
                      type="button"
                      onClick={savePreferences}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#2f7d6d]/30 transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                    >
                      <IconCheck size={18} strokeWidth={2.5} />
                      <span>Save Preferences ({draftKeys.length}/4 Selected)</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}



