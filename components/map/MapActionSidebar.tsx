"use client";

import React from "react";
import { Menu, Bookmark, History, ArrowRight } from "lucide-react";

export type SidebarViewType = "none" | "list" | "saved" | "recents";

interface MapActionSidebarProps {
  activeView: SidebarViewType;
  setActiveView: (view: SidebarViewType) => void;
  onMenuClick?: () => void;
  onSavedClick?: () => void;
}

export default function MapActionSidebar({
  activeView,
  setActiveView,
  onMenuClick,
  onSavedClick,
}: MapActionSidebarProps) {
  const handleViewChange = (view: SidebarViewType) => {
    // Toggle off if clicking the currently active view
    if (activeView === view) {
      setActiveView("none");
    } else {
      setActiveView(view);
    }
  };

  return (
    <>
      {/* DESKTOP NARROW SIDEBAR (Far Left) */}
      <div className="hidden md:flex flex-col items-center w-[72px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full py-4 shadow-[4px_0_12px_rgba(0,0,0,0.05)] z-[100] shrink-0">
        <button
          onClick={onMenuClick}
          className="p-3 mb-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          title="Menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col gap-6 w-full items-center">
          <button
            onClick={() => {
              if (onSavedClick) onSavedClick();
              else handleViewChange("saved");
            }}
            className="flex flex-col items-center gap-1 group w-full relative"
            title="Saved"
          >
            {activeView === "saved" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <div
              className={`p-3 rounded-full transition-colors ${
                activeView === "saved"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
              }`}
            >
              <Bookmark size={24} className={activeView === "saved" ? "fill-primary text-primary" : ""} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeView === "saved" ? "text-primary" : "text-gray-500"
              }`}
            >
              Saved
            </span>
          </button>

          <button
            onClick={() => handleViewChange("recents")}
            className="flex flex-col items-center gap-1 group w-full relative"
            title="Recents"
          >
            {activeView === "recents" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <div
              className={`p-3 rounded-full transition-colors ${
                activeView === "recents"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
              }`}
            >
              <History size={24} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeView === "recents" ? "text-primary" : "text-gray-500"
              }`}
            >
              Recents
            </span>
          </button>
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-[65px] z-[200] pb-safe px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
         <button
            onClick={() => handleViewChange("list")}
            className="flex flex-col items-center gap-1 w-1/4 pt-1"
          >
            <div
              className={`transition-colors ${
                activeView === "list" || activeView === "none"
                  ? "text-primary"
                  : "text-gray-500"
              }`}
            >
              <Menu size={22} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeView === "list" || activeView === "none" ? "text-primary" : "text-gray-500"
              }`}
            >
              Explore
            </span>
          </button>

          <button
            onClick={() => {
              if (onSavedClick) onSavedClick();
              else handleViewChange("saved");
            }}
            className="flex flex-col items-center gap-1 w-1/4 pt-1"
          >
            <div
              className={`transition-colors ${
                activeView === "saved"
                  ? "text-primary"
                  : "text-gray-500"
              }`}
            >
              <Bookmark size={22} className={activeView === "saved" ? "fill-primary" : ""} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeView === "saved" ? "text-primary" : "text-gray-500"
              }`}
            >
              Saved
            </span>
          </button>

          <button
            onClick={() => handleViewChange("recents")}
            className="flex flex-col items-center gap-1 w-1/4 pt-1"
          >
            <div
              className={`transition-colors ${
                activeView === "recents"
                  ? "text-primary"
                  : "text-gray-500"
              }`}
            >
              <History size={22} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeView === "recents" ? "text-primary" : "text-gray-500"
              }`}
            >
              Recents
            </span>
          </button>
      </div>
    </>
  );
}
