import { renderHook, act } from '@testing-library/react';
import { usePropertyCreatorLogic } from '../use-property-creator-logic';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: () => ({
    edgestore: {
      publicFiles: { upload: jest.fn().mockResolvedValue({ url: 'mocked-url' }) },
      identityDocs: { upload: jest.fn().mockResolvedValue({ url: 'mocked-doc-url' }) },
    },
  }),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn, onSuccess, onError }: any) => ({
    mutateAsync: jest.fn(async (data) => {
      try {
        const res = await mutationFn(data);
        if (onSuccess) onSuccess(res);
        return res;
      } catch (err) {
        if (onError) onError(err);
        throw err;
      }
    }),
  }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

describe('usePropertyCreatorLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values and sets isMounted to true', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => usePropertyCreatorLogic({}));
    
    expect(result.current.isMounted).toBe(false);
    expect(result.current.currentStep).toBe(0);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    expect(result.current.isMounted).toBe(true);
    jest.useRealTimers();
  });

  it('can navigate backward', () => {
    const { result } = renderHook(() => usePropertyCreatorLogic({}));
    
    act(() => {
      // Force set to step 2 for testing
      result.current.setCurrentStep(2);
    });
    expect(result.current.currentStep).toBe(2);
    
    // Test scroll to top
    window.scrollTo = jest.fn();
    
    act(() => {
      result.current.handleBack();
    });
    
    expect(result.current.currentStep).toBe(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('updates coordinates on location select', () => {
    const { result } = renderHook(() => usePropertyCreatorLogic({}));
    
    act(() => {
      result.current.handleLocationSelect(14.5995, 120.9842);
    });
    
    expect(result.current.getValues('location.coordinates')).toEqual([14.5995, 120.9842]);
  });
});
