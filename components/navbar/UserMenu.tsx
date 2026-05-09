"use client";
import React, { useEffect, useState, useTransition, useRef } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "next-auth";

import Avatar from "../common/Avatar";
import MenuItem from "./MenuItem";
import Menu from "@/components/common/Menu";
import HostApplicationModal from "../modals/HostApplicationModal";
import Modal from "../modals/Modal";
import AuthModal from "../modals/AuthModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { menuItems } from "@/utils/constants";
import { useLoading } from "@/components/loading/LoadingContext";
import { getUnreadNotificationStats, getUnreadNotifications, markNotificationsAsRead, NotificationType } from "@/services/notification";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { toast as hotToast } from "react-hot-toast";
import { useMenuPanel } from "@/hooks/use-menu-panel";

interface UserMenuProps {
  user?: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [unreadStats, setUnreadStats] = useState<{ total: number; byType: Record<string, number> } | null>(null);
  const [hasClearedOuterDot, setHasClearedOuterDot] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const hasTriggeredInitialToast = useRef(false);
  const { startLoading } = useLoading();
  const toast = useResponsiveToast();
  const { onOpen } = useMenuPanel();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isFetching = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      
      try {
        const stats = await getUnreadNotificationStats();
        
        // 🔐 GHOST SESSION DETECTION: 
        // If the UI thinks we are logged in (user prop exists) but the server 
        // says the session is gone (stats is null), force a UI refresh.
        if (!stats && user?.id) {
          console.warn("🔐 Session mismatch detected in background. Refreshing UI...");
          router.refresh();
          return;
        }

        if (!stats) return;

        // Toast Trigger Logic
        const notifications = await getUnreadNotifications();
        const latest = notifications.length > 0 ? notifications[0] : null;

        const isNewNotification = latest && latest.id !== lastNotificationId;
        const isFirstNotificationOnLogin = isInitialFetch && stats.total > 0;

        if (isNewNotification || isFirstNotificationOnLogin) {
          setHasClearedOuterDot(false);

          const triggerToast = () => {
            if (notifications.length > 0) {
              const priorityNotif = notifications.find(n => 
                n.title.toLowerCase().includes("complete") || 
                n.title.toLowerCase().includes("pay") ||
                n.description.toLowerCase().includes("complete")
              );

              const activeNotif = priorityNotif || latest;

              const title = isInitialFetch 
                ? `You have ${stats.total} unread notification${stats.total > 1 ? 's' : ''}` 
                : activeNotif!.title;
              
              toast.info({
                title: title,
                description: activeNotif!.description,
              });
              
              setIsInitialFetch(false);
            }
          };

          if (isFirstNotificationOnLogin && !hasTriggeredInitialToast.current) {
            hasTriggeredInitialToast.current = true;
            // Longer delay for mobile/initial load to ensure Sileo is ready
            timeoutRef.current = setTimeout(triggerToast, 2000);
          } else if (isNewNotification) {
            triggerToast();
          }
        }

        if (latest && latest.id !== lastNotificationId) {
          setLastNotificationId(latest.id);
        }
        setUnreadStats(stats);
      } catch (error) {
        console.error("Error fetching notification stats:", error);
      } finally {
        isFetching.current = false;
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, unreadStats?.total, lastNotificationId, isInitialFetch]);

  const handleMenuOpen = () => {
    setHasClearedOuterDot(true);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onOpen();
    }
  };

  const redirect = async (url: string, label: string) => {
    if (window.location.pathname !== url) {
      startLoading();
    }
    router.push(url);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut({ callbackUrl: "/" });
  };

  const getUnreadCountForPath = (path: string): number => {
    if (!unreadStats) return 0;
    const lowerPath = path.toLowerCase();

    let count = 0;
    if (lowerPath.includes("inquir")) count = unreadStats.byType["inquiry"] || 0;
    else if (lowerPath.includes("reservation")) count = unreadStats.byType["reservation"] || 0;
    else if (lowerPath.includes("review")) count = unreadStats.byType["review"] || 0;
    else if (lowerPath.includes("message")) count = unreadStats.byType["message"] || 0;

    return count;

  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <Modal>
          {user ? (
            <Modal.Trigger name="host-application">
              <button
                type="button"
                className="hidden md:block text-sm py-3 px-4 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-600 dark:text-gray-300 font-medium"
              >
                Become a Host
              </button>
            </Modal.Trigger>
          ) : (
            <Modal.Trigger name="Login">
              <button
                type="button"
                className="hidden md:block text-sm py-3 px-4 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-600 dark:text-gray-300 font-medium"
              >
                Become a Host
              </button>
            </Modal.Trigger>
          )}
          <Menu>
            <Menu.Toggle id="user-menu">
              <button
                onClick={handleMenuOpen}
                type="button"
                className=" p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 dark:border-gray-700 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition duration-300 bg-white dark:bg-gray-800 relative group"
              >
                <div className="relative">
                  <AiOutlineMenu className="text-text-primary dark:text-gray-100" />
                  {unreadStats && unreadStats.total > 0 && !hasClearedOuterDot && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-600 rounded-full border border-white dark:border-gray-800" />
                  )}
                </div>
                <div className="hidden md:block">
                  <Avatar src={user?.image} name={user?.name} className="w-8 h-8" />
                </div>
              </button>
            </Menu.Toggle>
            <Menu.List className="hidden md:block shadow-[0_0_36px_4px_rgba(0,0,0,0.075)] rounded-xl bg-white dark:bg-gray-800 text-sm overflow-hidden">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 invisible md:visible h-0 md:h-auto overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name || user.email}</p>
                  </div>
                  {menuItems.map((item) => {
                    const unreadCount = getUnreadCountForPath(item.path);
                    return (
                      <MenuItem
                        label={item.label}
                        hasNotification={unreadCount > 0}
                        onClick={() => redirect(item.path, item.label)}
                        key={item.label}
                      />
                    );
                  })}

                  <Modal.Trigger name="host-application">
                    <MenuItem label="Become a Host" />
                  </Modal.Trigger>
                  {(user as { role?: string })?.role === "admin" && (
                    <MenuItem label="Admin" onClick={() => redirect("/admin", "Admin")} />
                  )}
                  <hr className="border-gray-100 dark:border-gray-700" />
                  <MenuItem label="Log out" onClick={() => setShowLogoutConfirm(true)} />
                </>
              ) : (
                <>
                  <Modal.Trigger name="Login">
                    <MenuItem label="Log in" />
                  </Modal.Trigger>

                  <Modal.Trigger name="Sign up">
                    <MenuItem label="Sign up" />
                  </Modal.Trigger>
                </>
              )}
            </Menu.List>
          </Menu>
          <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
            <AuthModal name="Login" />
          </Modal.Window>
          <Modal.Window name="Sign up" size="sm" closeOnOutsideClick={false}>
            <AuthModal name="Sign up" />
          </Modal.Window>
          <Modal.Window name="host-application" size="xl" closeOnOutsideClick={false}>
            <HostApplicationModal />
          </Modal.Window>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          width="xs"
        >
          <ConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleLogout}
            title="Sign Out?"
            message={`Are you sure you want to sign out of your account, ${user?.name || 'User'}? Any unsaved changes may be lost.`}
            confirmLabel="Logout"
            cancelLabel="Stay"
            isLoading={isLoggingOut}
            variant="danger"
          />
        </Modal>
      </div>
    </div>
  );
};

export default UserMenu;
