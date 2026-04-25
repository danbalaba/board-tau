'use client';

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSidebar } from "./ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    id?: string;
    image?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Extract initials cleanly
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    ?.toUpperCase() || 'AD';

  // We detect if the passed className implies a rounded-lg design or full circle
  const isRoundedLg = className?.includes('rounded-lg');
  const borderClass = isRoundedLg ? 'rounded-lg' : 'rounded-full';

  return (
    <motion.div 
      className={cn('flex items-center cursor-pointer group', showInfo ? 'gap-3 w-full' : 'justify-center')}
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.05, rotate: 2 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative flex shrink-0 items-center justify-center z-10",
          borderClass,
          className || "h-8 w-8"
        )}
      >
        {/* Subtle animated background ring on hover */}
        <div className={cn(
          "absolute inset-[-3px] z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-gradient-to-tr from-primary/50 via-primary/20 to-primary/50 dark:from-primary/60 dark:via-primary/30 dark:to-primary/60 animate-pulse scale-105",
          borderClass
        )} />
        
        <Avatar className={cn("relative z-20 h-full w-full border border-border/10 shadow-sm transition-shadow group-hover:shadow-md", borderClass)}>
          <AvatarImage src={user?.image || ''} alt={user?.name || ''} className="object-cover" />
          <AvatarFallback className={cn(
            'bg-gradient-to-br from-primary/10 to-primary/5 text-primary dark:from-primary/30 dark:to-primary/10 font-bold',
            borderClass
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {showInfo && !isCollapsed && (
        <motion.div 
          className='grid flex-1 text-left text-sm leading-tight overflow-hidden'
          variants={{
            initial: { x: 0, opacity: 0.8 },
            hover: { x: 2, opacity: 1 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className='truncate font-bold tracking-tight text-foreground transition-colors group-hover:text-primary'>
            {user?.name || 'Administrator'}
          </span>
          <span className='truncate text-xs text-muted-foreground font-medium'>
            {user?.email || 'admin@boardtau.com'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
