import { useRegisterActions } from 'kbar';
import { useTheme } from 'next-themes';
import { IconPalette, IconSun, IconMoon } from '@tabler/icons-react';

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeAction = [
    {
      id: 'toggleTheme',
      name: 'Switch Appearance',
      section: 'Appearance',
      icon: <IconPalette size={18} />,
      perform: toggleTheme
    },
    {
      id: 'setLightTheme',
      name: 'Light Mode',
      section: 'Appearance',
      icon: <IconSun size={18} />,
      perform: () => setTheme('light')
    },
    {
      id: 'setDarkTheme',
      name: 'Dark Mode',
      section: 'Appearance',
      icon: <IconMoon size={18} />,
      perform: () => setTheme('dark')
    }
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;
