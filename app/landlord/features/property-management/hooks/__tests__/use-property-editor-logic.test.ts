import { renderHook, act } from '@testing-library/react';
import { usePropertyEditorLogic } from '../use-property-editor-logic';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
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

describe('usePropertyEditorLogic', () => {
  const initialData = {
    id: 'test-id',
    title: 'Initial Title',
    description: 'Initial Description that is long enough to pass validation in the editor component.',
    price: 1000,
    category: 'Apartment',
    roomCount: 1,
    bathroomCount: 1,
    region: 'Region 1',
    address: '123 Test St',
    city: 'Test City',
    zipCode: '1234',
    latitude: 15,
    longitude: 120,
    amenities_list: ['WiFi'],
    rooms: [
      {
        id: 'room-1',
        roomType: 'SOLO',
        price: 1000,
        capacity: 1,
        bedType: 'SINGLE',
        bedCount: 1,
        size: 10,
        availableSlots: 1,
        reservationFee: 500,
        amenities: [],
      }
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with mapped initial data', () => {
    const { result } = renderHook(() => usePropertyEditorLogic(initialData));
    
    expect(result.current.formData.title).toBe('Initial Title');
    expect(result.current.formData.price).toBe(1000);
    expect(result.current.formData.latlng).toEqual([120, 15]);
    expect(result.current.formData.rooms.length).toBe(1);
  });

  it('handles tracking dirty state and undo/reset', () => {
    const { result } = renderHook(() => usePropertyEditorLogic(initialData));
    
    act(() => {
      result.current.saveHistory();
      result.current.setFormData((prev: any) => ({ ...prev, title: 'Changed Title' }));
    });
    
    expect(result.current.formData.title).toBe('Changed Title');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.canUndo).toBe(true);
    
    act(() => {
      result.current.handleUndo();
    });
    
    expect(result.current.formData.title).toBe('Initial Title');
  });

  it('adds and removes rooms', () => {
    const { result } = renderHook(() => usePropertyEditorLogic(initialData));
    
    act(() => {
      result.current.addRoom();
    });
    
    expect(result.current.formData.rooms.length).toBe(2);
    
    act(() => {
      result.current.removeRoom(1);
    });
    
    expect(result.current.formData.rooms.length).toBe(1);
  });
});
