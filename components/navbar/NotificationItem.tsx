"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Home, CalendarCheck, Star, MessageCircle } from "lucide-react";
import { NotificationItem as NotificationType } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { useMenu } from "@/components/common/Menu";

interface NotificationItemProps {
  notification: NotificationType;
  onClick: () => void;
}

const getIconConfig = (type: string) => {
  switch (type.toLowerCase()) {
    case "inquiry":
      return {
        icon: Home,
        bgClass: "bg-blue-100 dark:bg-blue-900/30",
        iconClass: "text-blue-600 dark:text-blue-400",
      };
    case "reservation":
      return {
        icon: CalendarCheck,
        bgClass: "bg-green-100 dark:bg-green-900/30",
        iconClass: "text-green-600 dark:text-green-400",
      };
    case "review":
      return {
        icon: Star,
        bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
        iconClass: "text-yellow-600 dark:text-yellow-400",
      };
    case "message":
      return {
        icon: MessageCircle,
        bgClass: "bg-purple-100 dark:bg-purple-900/30",
        iconClass: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        icon: Home,
        bgClass: "bg-gray-100 dark:bg-gray-800",
        iconClass: "text-gray-600 dark:text-gray-400",
      };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const router = useRouter();
  const { icon: Icon, bgClass, iconClass } = getIconConfig(notification.type);

  const { close } = useMenu();

  const handleClick = () => {
    onClick();
    if (notification.link) {
      router.push(notification.link);
    }
    close();
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition duration-200 
        ${notification.isRead 
          ? "hover:bg-neutral-100 dark:hover:bg-gray-800/60" 
          : "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20"
        }
      `}
    >
      <div className={`flex-shrink-0 p-2 rounded-full ${bgClass}`}>
        <Icon size={20} className={iconClass} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.isRead ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-900 dark:text-white font-semibold"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {notification.description}
        </p>
        <span className="text-[10px] font-medium text-primary dark:text-primary-light-color mt-1 block">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>

      {!notification.isRead && (
        <div className="flex-shrink-0 flex items-center justify-center h-full pt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
