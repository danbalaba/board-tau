import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ResponsiveToastProvider, useResponsiveToast } from '../ResponsiveToast';
import * as reactResponsive from 'react-responsive';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  }),
}));

// Mock sileo
jest.mock('sileo', () => ({
  sileo: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  Toaster: () => <div data-testid="sileo-toaster" />,
}));

// Mock Toast (HotToaster)
jest.mock('../Toast', () => ({
  Toaster: () => <div data-testid="hot-toaster" />,
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('ResponsiveToast', () => {
  const hotToast = require('react-hot-toast').default;
  const { sileo } = require('sileo');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop behavior', () => {
    beforeEach(() => {
      jest.spyOn(reactResponsive, 'useMediaQuery').mockReturnValue(false);
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    });

    const TestComponent = ({ type, message }: { type: string, message: any }) => {
      const toast = useResponsiveToast();
      React.useEffect(() => {
        (toast as any)[type](message);
      }, [toast, type, message]);
      return <div>Testing Toasts</div>;
    };

    it('renders HotToaster when not mobile', () => {
      render(
        <ResponsiveToastProvider>
          <TestComponent type="success" message="Test message" />
        </ResponsiveToastProvider>
      );
    });

    it('calls hot-toast success', () => {
      render(
        <ResponsiveToastProvider>
          <TestComponent type="success" message="Success message" />
        </ResponsiveToastProvider>
      );
      
      expect(hotToast.success).toHaveBeenCalledWith('Success message', undefined);
    });

    it('calls hot-toast error', () => {
      render(
        <ResponsiveToastProvider>
          <TestComponent type="error" message="Error message" />
        </ResponsiveToastProvider>
      );
      
      expect(hotToast.error).toHaveBeenCalledWith('Error message', undefined);
    });
  });

  describe('Mobile behavior', () => {
    beforeEach(() => {
      jest.spyOn(reactResponsive, 'useMediaQuery').mockReturnValue(true);
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    });

    const TestComponent = ({ type, message }: { type: string, message: any }) => {
      const toast = useResponsiveToast();
      React.useEffect(() => {
        (toast as any)[type](message);
      }, [toast, type, message]);
      return <div>Testing Toasts</div>;
    };

    it('calls sileo success', () => {
      render(
        <ResponsiveToastProvider>
          <TestComponent type="success" message="Success message" />
        </ResponsiveToastProvider>
      );
      
      expect(sileo.success).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Success message',
      }));
    });

    it('calls sileo error with object', () => {
      render(
        <ResponsiveToastProvider>
          <TestComponent type="error" message={{ title: 'Error', description: 'Failed' }} />
        </ResponsiveToastProvider>
      );
      
      expect(sileo.error).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        description: 'Failed',
      }));
    });
  });

  describe('Fallback hook behavior', () => {
    it('returns dummy functions if used outside provider', () => {
      const TestComponent = () => {
        const toast = useResponsiveToast();
        toast.success('test');
        toast.error('test');
        toast.warning('test');
        toast.info('test');
        toast.loading('test');
        toast.toast('test');
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).not.toThrow();
    });
  });
});
