import { renderHook, act } from '@testing-library/react';
import { useWalkInModal } from '../use-walk-in-modal';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';
import { useKYC } from '@/hooks/useKYC';

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn()
}));

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn()
}));

jest.mock('@/hooks/useKYC', () => ({
  useKYC: jest.fn()
}));

jest.mock('react-hook-form', () => {
  const original = jest.requireActual('react-hook-form');
  return {
    ...original,
    useForm: () => ({
      register: jest.fn(),
      handleSubmit: jest.fn((fn) => fn),
      formState: { errors: {} },
      setValue: jest.fn(),
      getValues: jest.fn(() => ({
        listingId: 'list-1',
        roomId: 'room-1',
        guestName: 'John',
        occupantsCount: 1,
        moveInDate: '2023-01-01',
        checkOutDate: '2023-01-30',
        totalPrice: 1000
      })),
      trigger: jest.fn().mockResolvedValue(true),
      watch: jest.fn(),
      control: {},
      clearErrors: jest.fn()
    })
  };
});

describe('useWalkInModal', () => {
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockEdgestore = {
    identityDocs: { upload: jest.fn().mockResolvedValue({ url: 'http://test.com/img.jpg' }) }
  };
  const mockKYC = {
    isProcessing: false,
    faceEngine: { validateFace: jest.fn().mockResolvedValue({ isValid: true }) },
    idEngine: { validateIDCard: jest.fn().mockResolvedValue({ isValid: true }) }
  };
  
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({ success: mockSuccess, error: mockError });
    (useEdgeStore as jest.Mock).mockReturnValue({ edgestore: mockEdgestore });
    (useKYC as jest.Mock).mockReturnValue(mockKYC);
    global.fetch = jest.fn();
  });

  it('initializes at step 1', () => {
    const { result } = renderHook(() => useWalkInModal('landlord-1', mockOnSuccess, mockOnClose));
    expect(result.current.currentStep).toBe(1);
    expect(result.current.totalSteps).toBe(6);
  });

  it('navigates forward when step is completed and valid', async () => {
    const { result } = renderHook(() => useWalkInModal('landlord-1', mockOnSuccess, mockOnClose));
    
    await act(async () => {
      await result.current.handleNextStep();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('navigates backward', () => {
    const { result } = renderHook(() => useWalkInModal('landlord-1', mockOnSuccess, mockOnClose));
    
    act(() => {
      // Force step 2 to test prev
      result.current.setCurrentStep(2);
    });

    act(() => {
      result.current.handlePrevStep();
    });

    expect(result.current.currentStep).toBe(1);
  });
});
