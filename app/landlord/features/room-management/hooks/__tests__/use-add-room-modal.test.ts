import { renderHook, act } from '@testing-library/react';
import { useAddRoomModal } from '../use-add-room-modal';

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: () => ({
    edgestore: {
      publicFiles: {
        upload: jest.fn().mockResolvedValue({ url: 'test-url' })
      }
    }
  }),
}));

describe('useAddRoomModal', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values and step 1', () => {
    const { result } = renderHook(() => useAddRoomModal({ onClose: mockOnClose }));
    expect(result.current.currentStep).toBe(1);
    expect(result.current.formData.listingId).toBe('');
  });

  it('hydrates initialData if provided', () => {
    const mockInitialData = { name: 'Test Room', price: 1000 };
    const { result } = renderHook(() => useAddRoomModal({
      initialData: mockInitialData,
      onClose: mockOnClose
    }));
    expect(result.current.formData.name).toBe('Test Room');
    expect(result.current.formData.price).toBe('1000');
  });

  it('validates step 1', () => {
    const { result } = renderHook(() => useAddRoomModal({ onClose: mockOnClose }));
    act(() => {
      result.current.handleNext();
    });
    // Should fail validation and stay on step 1
    expect(result.current.currentStep).toBe(1);
    expect(result.current.errors.name).toBe('Room name is required');
  });

  it('handles category toggle and resets related fields', () => {
    const { result } = renderHook(() => useAddRoomModal({ onClose: mockOnClose }));
    act(() => {
      result.current.handleCategoryToggle('SOLO');
    });
    expect(result.current.formData.roomType).toBe('SOLO');
    
    act(() => {
      // Toggle off
      result.current.handleCategoryToggle('SOLO');
    });
    expect(result.current.formData.roomType).toBe('');
  });

  it('handles changes and auto calculates capacity', () => {
    const { result } = renderHook(() => useAddRoomModal({ onClose: mockOnClose }));
    act(() => {
      result.current.handleChange({ target: { name: 'roomType', value: 'BEDSPACE' } });
      result.current.handleChange({ target: { name: 'bedType', value: 'BUNK' } });
      result.current.handleChange({ target: { name: 'bedCount', value: '2' } });
    });
    
    // 2 bunk beds = 4 capacity
    expect(result.current.formData.capacity).toBe('4');
  });

  it('progresses to step 2 when step 1 is valid', () => {
    const { result } = renderHook(() => useAddRoomModal({ onClose: mockOnClose }));
    act(() => {
      result.current.setFormData(prev => ({
        ...prev,
        listingId: 'listing-1',
        name: 'Room',
        roomType: 'SOLO',
        bathroomArrangement: 'PRIVATE_CR'
      }));
    });
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(2);
  });
});
