'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Mail,
  CalendarCheck,
  CalendarDays,
  Star,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  X,
  ChevronRight,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Modal from '@/components/modals/Modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useMenuPanel } from '@/hooks/use-menu-panel';
import { useLoadingStore } from '@/hooks/use-loading-store';
import { useLandlordProfileStore } from '@/app/landlord/features/settings-hub/hooks/use-landlord-profile-store';
import { useNotifications } from '@/app/landlord/features/notifications/hooks/use-notifications';
import Avatar from '@/components/common/Avatar';

interface LandlordRightSwipePanelProps {
  user?: any;
}

export default function LandlordRightSwipePanel({ user: initialUser }: LandlordRightSwipePanelProps) {
  const router = useRouter();
  const pathname = (typeof usePathname === 'function' ? usePathname() : "") || "";
  const { isOpen, onOpen, onClose } = useMenuPanel();
  const { unreadCount } = useNotifications();
  const { isLoggingOut, setIsLoggingOut } = useLoadingStore();

  const storeUser = useLandlordProfileStore((state: any) => state.user);
  const openSettings = useLandlordProfileStore((state: any) => state.openSettings);
  const currentUser = storeUser || initialUser;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isInteractable, setIsInteractable] = useState(false);

  // Interaction shield & Body Scroll Lock
  useEffect(() => {
    const body = document.body;
    const rootNode = document.documentElement;

    const restoreScroll = () => {
      const top = parseFloat(body.style.top) * -1;
      body.style.overflow = '';
      body.style.paddingRight = '';
      body.style.top = '';
      body.classList.remove('fixed', 'w-full');
      if (top) {
        window.scrollTo(0, top);
      }
    };

    if (isOpen) {
      const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px';
      body.style.top = `-${scrollTop}px`;
      body.classList.add('fixed', 'w-full');

      const timer = setTimeout(() => setIsInteractable(true), 500);
      return () => {
        clearTimeout(timer);
        restoreScroll();
      };
    } else {
      setIsInteractable(false);
      restoreScroll();
    }
  }, [isOpen]);

  const redirect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleLogoutClick = () => {
    onClose();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  const navItems = [
    { href: '/landlord', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/landlord/properties', label: 'Properties', icon: Building2 },
    { href: '/landlord/rooms', label: 'Rooms', icon: BedDouble },
    { href: '/landlord/inquiries', label: 'Inquiries', icon: Mail, badge: unreadCount },
    { href: '/landlord/reservations', label: 'Reservations', icon: CalendarCheck },
    { href: '/landlord/bookings', label: 'Bookings', icon: CalendarDays },
    { href: '/landlord/reviews', label: 'Reviews', icon: Star },
    { href: '/landlord/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/landlord/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <Modal>
      {/* Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel Container */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-[360px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl z-50 md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] border-l border-white/20 dark:border-white/5 overflow-hidden flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className={`h-full flex flex-col ${isInteractable ? "pointer-events-auto" : "pointer-events-none"}`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white opacity-80">
                  Landlord Navigation
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Theme Toggle Container */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <ThemeToggle />
              </div>

              {/* User Profile Card */}
              {currentUser && (
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/30">
                        <Avatar src={currentUser.image || currentUser.profileImage} alt={currentUser.name || 'Landlord'} />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {currentUser.name || 'Landlord User'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 text-[9px] font-extrabold uppercase tracking-widest rounded-md">
                        Host Account
                      </span>
                    </div>
                  </div>

                  {/* Settings Hub Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openSettings('profile');
                    }}
                    className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-violet-500" />
                      <span>Settings Hub</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              {/* Navigation Items Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/landlord' && pathname.startsWith(item.href));

                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => redirect(item.href)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#2f7d6d] text-white font-bold shadow-md shadow-[#2f7d6d]/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>

                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-full">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                <hr className="my-3 border-gray-100 dark:border-gray-800" />

                {/* Switch to Student Portal View */}
                <button
                  type="button"
                  onClick={() => redirect('/')}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-sm">Student View</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* Log Out */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-semibold"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutConfirm && !isLoggingOut} onClose={() => setShowLogoutConfirm(false)} width="xs">
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
          title="Sign Out Dashboard?"
          message={`Ready to leave the dashboard, ${currentUser?.name || 'Landlord'}? We'll make sure your property data is synced.`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>

      {/* Swipe Trigger Handle */}
      {!isOpen && (
        <div
          className="fixed top-1/3 -translate-y-1/2 right-0 w-8 h-32 z-40 md:hidden group cursor-pointer flex items-center justify-end"
          onClick={onOpen}
        >
          <div className="w-3 h-24 bg-neutral-900 dark:bg-white/20 rounded-l-3xl backdrop-blur-xl border-l border-t border-b border-white/20 group-hover:w-5 group-active:w-6 transition-all duration-500 shadow-[-5px_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-8 bg-white/40 rounded-full" />
              <div className="w-0.5 h-8 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
