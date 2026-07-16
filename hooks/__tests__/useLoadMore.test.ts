import { renderHook, act } from '@testing-library/react';
import { useLoadMore } from '../useLoadMore';

describe('useLoadMore', () => {
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let observerCallback: (entries: IntersectionObserverEntry[]) => void;

  beforeEach(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();

    // Mock IntersectionObserver
    (window as any).IntersectionObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: jest.fn(),
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).IntersectionObserver;
  });

  it('calls loadMoreData when intersecting and conditions are met', () => {
    const loadMoreData = jest.fn();
    const { result } = renderHook(() => 
      useLoadMore(loadMoreData, true, false, false)
    );

    // Simulate ref attachment
    const dummyElement = document.createElement('div');
    result.current.ref.current = dummyElement as any;

    // Trigger useEffect manually by unmounting/remounting or just trusting React 18 renderHook
    // Actually renderHook runs useEffect immediately
    
    expect((window as any).IntersectionObserver).toHaveBeenCalled();

    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(loadMoreData).toHaveBeenCalledTimes(1);
  });

  it('does not call loadMoreData if not intersecting', () => {
    const loadMoreData = jest.fn();
    renderHook(() => useLoadMore(loadMoreData, true, false, false));

    act(() => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    expect(loadMoreData).not.toHaveBeenCalled();
  });

  it('does not call loadMoreData if isLoading is true', () => {
    const loadMoreData = jest.fn();
    renderHook(() => useLoadMore(loadMoreData, true, true, false));

    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(loadMoreData).not.toHaveBeenCalled();
  });

  it('does not call loadMoreData if hasMoreData is false', () => {
    const loadMoreData = jest.fn();
    renderHook(() => useLoadMore(loadMoreData, false, false, false));

    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(loadMoreData).not.toHaveBeenCalled();
  });

  it('does not call loadMoreData if isError is true', () => {
    const loadMoreData = jest.fn();
    renderHook(() => useLoadMore(loadMoreData, true, false, true));

    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(loadMoreData).not.toHaveBeenCalled();
  });
});
