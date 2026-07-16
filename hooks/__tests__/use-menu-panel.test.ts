import { renderHook, act } from '@testing-library/react';
import { useMenuPanel } from '../use-menu-panel';

describe('useMenuPanel', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMenuPanel());
    act(() => {
      result.current.onClose();
    });
  });

  it('initializes with isOpen as false', () => {
    const { result } = renderHook(() => useMenuPanel());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens the menu panel', () => {
    const { result } = renderHook(() => useMenuPanel());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes the menu panel', () => {
    const { result } = renderHook(() => useMenuPanel());

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
