'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from "../../lib/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot='select-group' {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      data-size={size}
      className={cn(
        "group flex w-full items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:border-gray-400 focus-visible:ring-4 focus-visible:ring-gray-200/60 dark:focus-visible:ring-gray-700/40 rounded-2xl pr-3 pl-4 py-2.5 shadow-sm transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400 [&>span]:line-clamp-1 text-[13px] sm:text-[14px] font-bold text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <div className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-400 group-data-[state=open]:bg-gray-200 dark:group-data-[state=open]:bg-gray-600 group-data-[state=open]:text-gray-600 dark:group-data-[state=open]:text-gray-300 group-data-[state=open]:rotate-180">
          <ChevronDownIcon className='h-3 w-3' strokeWidth={3} />
        </div>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot='select-content'
        className={cn(
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl',
          position === 'popper' &&
          'data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1.5',
            position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot='select-label'
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg py-2.5 pl-4 pr-10 text-[13px] sm:text-[14px] font-medium outline-none select-none transition-all duration-150 mb-0.5 last:mb-0 data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-600 dark:data-[highlighted]:text-emerald-400 text-gray-600 dark:text-gray-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-emerald-500/10 data-[state=checked]:text-emerald-600 dark:data-[state=checked]:text-emerald-400 data-[state=checked]:font-bold",
        className
      )}
      {...props}
    >
      <span className='absolute right-3 flex items-center justify-center'>
        <SelectPrimitive.ItemIndicator>
          <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckIcon className='h-3 w-3 text-emerald-600 dark:text-emerald-400' strokeWidth={4} />
          </div>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot='select-scroll-up-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className='size-4' />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot='select-scroll-down-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className='size-4' />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
