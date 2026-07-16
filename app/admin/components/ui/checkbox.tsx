'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from "../../lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 data-[state=checked]:bg-[#2f7d6d] data-[state=checked]:text-white data-[state=checked]:border-[#2f7d6d] focus-visible:border-[#2f7d6d] focus-visible:ring-[#2f7d6d]/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-md border-2 shadow-sm transition-colors duration-200 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400 dark:hover:border-gray-500',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current'
        asChild
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <CheckIcon className='size-3.5 stroke-[3.5]' />
        </motion.div>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
