import { renderHook, act } from '@testing-library/react';
import { useReservationLogic, ReservationRequest } from '../use-reservation-logic';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn()
}));

jest.mock('@/utils/pdfGenerator', () => ({
  generateTablePDF: jest.fn()
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn()
}));

const mockReservation: ReservationRequest = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Test Listing', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  status: 'pending_payment',
  moveInDate: new Date('2023-01-01'),
  stayDuration: 30,
  isArchived: false,
  createdAt: new Date('2023-01-01')
};

describe('useReservationLogic', () => {
  const mockRouter = { refresh: jest.fn() };
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockQueryClient = { invalidateQueries: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useResponsiveToast as jest.Mock).mockReturnValue({ success: mockSuccess, error: mockError });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    global.fetch = jest.fn();
  });

  it('initializes and filters pre-stay statuses', () => {
    const initialData = [mockReservation, { ...mockReservation, id: 'res-2', status: 'past_stay' }];
    const { result } = renderHook(() => useReservationLogic(initialData));
    
    // Should filter out past_stay automatically
    expect(result.current.rawReservations).toHaveLength(2);
    expect(result.current.totalReservations).toBe(1);
    expect(result.current.filteredReservations[0].id).toBe('res-1');
  });

  it('filters by selected status', () => {
    const initialData = [mockReservation, { ...mockReservation, id: 'res-2', status: 'reserved' }];
    const { result } = renderHook(() => useReservationLogic(initialData));
    
    act(() => {
      result.current.setSelectedStatus('reserved');
    });

    expect(result.current.totalReservations).toBe(1);
    expect(result.current.filteredReservations[0].status).toBe('reserved');
  });

  it('searches by guest name or property title', () => {
    const initialData = [mockReservation, { ...mockReservation, id: 'res-2', user: { ...mockReservation.user, name: 'Alice' } }];
    const { result } = renderHook(() => useReservationLogic(initialData));
    
    act(() => {
      result.current.setSearchQuery('alice');
    });

    expect(result.current.totalReservations).toBe(1);
    expect(result.current.filteredReservations[0].user.name).toBe('Alice');
  });

  it('updates reservation status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    const initialData = [mockReservation];
    const { result } = renderHook(() => useReservationLogic(initialData));
    
    await act(async () => {
      await result.current.handleUpdateStatus('res-1', 'confirmed');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/landlord/bookings?id=res-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed', reason: undefined })
    });
    
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["landlord-notifications"] });
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledWith('Reservation status updated to confirmed.');
    expect(result.current.rawReservations[0].status).toBe('confirmed');
  });
});
