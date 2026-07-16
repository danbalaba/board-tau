import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookingLogic, Booking } from '../use-booking-logic';

// Mock Dependencies
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockSuccess = jest.fn();
const mockError = jest.fn();
jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ success: mockSuccess, error: mockError }),
}));

const mockGenerateTablePDF = jest.fn();
jest.mock('@/utils/pdfGenerator', () => ({
  generateTablePDF: (...args: any[]) => mockGenerateTablePDF(...args),
}));

global.fetch = jest.fn();

const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  id: 'b-1',
  listing: { id: 'l-1', title: 'Sunny Apartment', imageSrc: '/img.jpg' },
  user: { id: 'u-1', name: 'John Doe', email: 'john@example.com' },
  status: 'CHECKED_IN',
  paymentStatus: 'paid',
  totalPrice: 5000,
  startDate: new Date('2023-01-01').toISOString(),
  endDate: new Date('2023-01-10').toISOString(),
  isArchived: false,
  createdAt: new Date('2023-01-01').toISOString(),
  ...overrides,
});

describe('useBookingLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes correctly and filters stay statuses', () => {
    const initialBookings = [
      createMockBooking({ id: 'b-1', status: 'CHECKED_IN' }),
      createMockBooking({ id: 'b-2', status: 'PENDING' }), // Should be filtered out
      createMockBooking({ id: 'b-3', status: 'COMPLETED' }),
    ];

    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    expect(result.current.filteredBookings).toHaveLength(2);
    expect(result.current.totalBookings).toBe(2);
  });

  it('filters by status and payment status', () => {
    const initialBookings = [
      createMockBooking({ id: 'b-1', status: 'CHECKED_IN', paymentStatus: 'paid' }),
      createMockBooking({ id: 'b-2', status: 'COMPLETED', paymentStatus: 'pending' }),
    ];

    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    act(() => {
      result.current.setSelectedStatus('checked_in');
    });
    expect(result.current.filteredBookings).toHaveLength(1);
    expect(result.current.filteredBookings[0].id).toBe('b-1');

    act(() => {
      result.current.setSelectedStatus('all');
      result.current.setSelectedPaymentStatus('pending');
    });
    expect(result.current.filteredBookings).toHaveLength(1);
    expect(result.current.filteredBookings[0].id).toBe('b-2');
  });

  it('searches correctly', () => {
    const initialBookings = [
      createMockBooking({ id: 'b-1', user: { id: 'u-1', name: 'Alice', email: 'alice@test.com' } }),
      createMockBooking({ id: 'b-2', user: { id: 'u-2', name: 'Bob', email: 'bob@test.com' } }),
    ];

    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    act(() => {
      result.current.setSearchQuery('Alice');
    });

    expect(result.current.filteredBookings).toHaveLength(1);
    expect(result.current.filteredBookings[0].id).toBe('b-1');
  });

  it('handles update status successfully', async () => {
    const initialBookings = [createMockBooking({ id: 'b-1', status: 'CHECKED_IN' })];
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    await act(async () => {
      await result.current.handleUpdateStatus('b-1', 'COMPLETED');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/landlord/bookings?id=b-1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ status: 'COMPLETED' })
    }));
    expect(mockSuccess).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles report generation', async () => {
    const initialBookings = [createMockBooking({ id: 'b-1' })];
    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    await act(async () => {
      await result.current.handleGenerateReport();
    });

    expect(mockGenerateTablePDF).toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('Generated enterprise report'));
  });

  it('handles archive record successfully', async () => {
    const initialBookings = [createMockBooking({ id: 'b-1' })];
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useBookingLogic(initialBookings, null));

    await act(async () => {
      await result.current.handleToggleArchiveRecord('b-1', false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/landlord/bookings?id=b-1', expect.objectContaining({
      method: 'PATCH',
    }));
    expect(mockSuccess).toHaveBeenCalled();
    expect(result.current.rawBookings).toHaveLength(0);
  });
});
