import { renderHook, act } from '@testing-library/react';
import { useInquiryLogic, Inquiry } from '../use-inquiry-logic';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { toast } from 'react-hot-toast';
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

jest.mock('react-hot-toast', () => ({
  toast: {
    loading: jest.fn(() => 'toast-id'),
    dismiss: jest.fn()
  }
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn()
}));

const mockInquiry: Inquiry = {
  id: 'inq-1',
  listingId: 'list-1',
  roomId: 'room-1',
  userId: 'user-1',
  moveInDate: new Date().toISOString(),
  checkOutDate: new Date().toISOString(),
  occupantsCount: 1,
  role: 'tenant',
  status: 'PENDING',
  isArchived: false,
  createdAt: new Date().toISOString(),
  listing: {
    id: 'list-1',
    title: 'Test Listing',
    imageSrc: '/img.jpg'
  },
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  }
};

describe('useInquiryLogic', () => {
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

  it('initializes with provided inquiries', () => {
    const initialData = { inquiries: [mockInquiry], nextCursor: null };
    const { result } = renderHook(() => useInquiryLogic(initialData));
    expect(result.current.rawInquiries).toHaveLength(1);
    expect(result.current.totalInquiries).toBe(1);
  });

  it('filters inquiries by status', () => {
    const initialData = { inquiries: [mockInquiry, { ...mockInquiry, id: 'inq-2', status: 'APPROVED' }], nextCursor: null };
    const { result } = renderHook(() => useInquiryLogic(initialData));
    
    act(() => {
      result.current.setSelectedStatus('APPROVED');
    });

    expect(result.current.filteredInquiries).toHaveLength(1);
    expect(result.current.filteredInquiries[0].status).toBe('APPROVED');
  });

  it('searches inquiries by user name or email', () => {
    const initialData = { inquiries: [mockInquiry, { ...mockInquiry, id: 'inq-2', user: { ...mockInquiry.user, name: 'Alice' } }], nextCursor: null };
    const { result } = renderHook(() => useInquiryLogic(initialData));
    
    act(() => {
      result.current.setSearchQuery('alice');
    });

    expect(result.current.filteredInquiries).toHaveLength(1);
    expect(result.current.filteredInquiries[0].user.name).toBe('Alice');
  });

  it('handles sorting', () => {
    const older = { ...mockInquiry, id: 'older', createdAt: new Date(2020, 1, 1).toISOString() };
    const newer = { ...mockInquiry, id: 'newer', createdAt: new Date(2022, 1, 1).toISOString() };
    
    const initialData = { inquiries: [older, newer], nextCursor: null };
    const { result } = renderHook(() => useInquiryLogic(initialData));
    
    // Default is newest
    expect(result.current.filteredInquiries[0].id).toBe('newer');

    act(() => {
      result.current.setSortBy('oldest');
    });

    expect(result.current.filteredInquiries[0].id).toBe('older');
  });

  it('handles response to inquiry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    const initialData = { inquiries: [mockInquiry], nextCursor: null };
    const { result } = renderHook(() => useInquiryLogic(initialData));
    
    await act(async () => {
      await result.current.handleRespond(mockInquiry.id, 'APPROVED');
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/landlord/inquiries?id=${mockInquiry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', message: undefined })
    });
    
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledWith('Inquiry approved successfully.');
    expect(result.current.rawInquiries[0].status).toBe('APPROVED');
  });
});
