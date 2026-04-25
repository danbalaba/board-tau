'use client';

import { useThemeConfig } from "./active-theme";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "../ui/select";

import { Icons } from '../icons';
import { THEMES } from './theme.config';

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  const currentTheme = THEMES.find(theme => theme.value === activeTheme);

  const handleThemeChange = (value: string, e?: React.MouseEvent) => {
    const root = document.documentElement;

    if (!document.startViewTransition) {
      setActiveTheme(value);
      return;
    }

    // Use default center if no event (e.g. keyboard)
    if (e) {
      root.style.setProperty('--x', `${e.clientX}px`);
      root.style.setProperty('--y', `${e.clientY}px`);
    } else {
      root.style.setProperty('--x', '50%');
      root.style.setProperty('--y', '50%');
    }

    document.startViewTransition(() => {
      setActiveTheme(value);
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={(value) => handleThemeChange(value)}>
        <SelectTrigger
          id='theme-selector'
          className='justify-start *:data-[slot=select-value]:w-24'
        >
          <span className='text-muted-foreground hidden sm:block'>
            <Icons.palette />
          </span>
          <span className='text-muted-foreground block sm:hidden'>Theme</span>
          <SelectValue placeholder='Select a theme'>
            {currentTheme?.name || 'Select a theme'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align='end'>
          {THEMES.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>themes</SelectLabel>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
