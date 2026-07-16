import { renderHook, act } from '@testing-library/react';
import { useEditRoom } from '../use-edit-room';

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

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: any) => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

describe('useEditRoom', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  const initialData = {
    id: 'room-1',
    name: 'Room 1',
    description: 'A very nice room with more than twenty characters.',
    roomType: 'SOLO',
    bathroomArrangement: 'PRIVATE_CR',
    bedType: 'SINGLE',
    bedCount: 1,
    price: 5000,
    capacity: 1,
    availableSlots: 1,
    reservationFee: 1000,
    size: 20,
    amenities: ['wifi'],
    images: ['img1.jpg']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates initial form state', () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    expect(result.current.formData.name).toBe('Room 1');
    expect(result.current.formData.price).toBe('5000');
    expect(result.current.isDirty).toBe(false);
  });

  it('tracks dirty state and handles changes', () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'Updated Room' } });
    });
    expect(result.current.formData.name).toBe('Updated Room');
    expect(result.current.isDirty).toBe(true);
  });

  it('handles undo functionality', () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'First Change' } });
    });
    expect(result.current.formData.name).toBe('First Change');
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.handleUndo();
    });
    expect(result.current.formData.name).toBe('Room 1');
  });

  it('resets form when roomType changes', () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    act(() => {
      result.current.handleChange({ target: { name: 'roomType', value: 'BEDSPACE' } });
    });
    // Should clear dependent fields
    expect(result.current.formData.roomType).toBe('BEDSPACE');
    expect(result.current.formData.bedType).toBe('');
    expect(result.current.formData.capacity).toBe('0');
  });

  it('toggles amenities correctly', () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    act(() => {
      result.current.handleAmenityToggle('aircon');
    });
    expect(result.current.formData.amenities).toContain('aircon');
    
    act(() => {
      result.current.handleAmenityToggle('wifi'); // existing
    });
    expect(result.current.formData.amenities).not.toContain('wifi');
  });

  it('handles submit validation failure', async () => {
    const { result } = renderHook(() => useEditRoom(initialData, mockOnSuccess, mockOnClose));
    act(() => {
      result.current.handleChange({ target: { name: 'name', value: '' } });
    });
    
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(result.current.errors.name).toBe('Room name is required');
  });
});
