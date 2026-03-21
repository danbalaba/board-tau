"use client";

import React, { useState, useEffect } from "react";
import { FaHeart, FaCalendarCheck, FaHome, FaUser, FaHotel } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { User } from "next-auth";

import Modal from "@/components/modals/Modal";
import AuthModal from "@/components/modals/AuthModal";
import HostApplicationModal from "@/components/modals/HostApplicationModal";
import Menu from "@/components/common/Menu";
import Avatar from "@/components/common/Avatar";


interface MobileBottomBarProps {
  user?: (User & { id: string; role?: string });
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ user }) => {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "">("");
  const [lastY, setLastY] = useState(0);

  // Implement scroll direction tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY === 0) {
        setScrollDirection("");
      } else if (currentY > lastY) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  const isHidden = scrollDirection === "down";

  const redirect = (url: string) => {
    router.push(url);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
        isHidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-2xl px-4 py-3 pb-6">
        {/* Safe area padding */}
        <div className="flex items-center justify-around gap-2">
          {/* Not logged in */}
          {!user ? (
            <>
              <Modal>
                <Modal.Trigger name="Login">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <FaUser className="text-sm" />
                    <span>Login</span>
                  </button>
                </Modal.Trigger>

                <Modal.Trigger name="Sign up">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <FaHome className="text-sm" />
                    <span>Signup</span>
                  </button>
                </Modal.Trigger>

                <Modal.Window name="Login" size="sm">
                  <AuthModal name="Login" />
                </Modal.Window>

                <Modal.Window name="Sign up" size="sm">
                  <AuthModal name="Sign up" />
                </Modal.Window>
              </Modal>
            </>
          ) : (
            <>
              {/* Home */}
              <button
                type="button"
                onClick={() => redirect("/")}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaHome className="text-xl text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Home
                </span>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => redirect("/favorites")}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaHeart className="text-xl text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Favorites
                </span>
              </button>

              {/* Reservations */}
              <button
                type="button"
                onClick={() => redirect("/reservations")}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaCalendarCheck className="text-xl text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Reservations
                </span>
              </button>

              {/* Become a Host */}
              <Modal>
                <Modal.Trigger name="host-application">
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaHotel className="text-xl text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Host
                    </span>
                  </button>
                </Modal.Trigger>

                <Modal.Window name="host-application" size="xl">
                  <HostApplicationModal />
                </Modal.Window>
              </Modal>

              {/* Profile */}
              <button
                type="button"
                onClick={() => redirect("/profile")}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="relative">
                  <Avatar src={user?.image} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Profile
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomBar;
