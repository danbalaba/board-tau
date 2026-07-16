import { renderHook, act } from '@testing-library/react';
import { useInquiryDetailLogic } from '../use-inquiry-detail-logic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(() => 'loading-toast-id'),
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('useInquiryDetailLogic', () => {
  const mockRouter = {
    refresh: jest.fn(),
    push: jest.fn(),
  };

  const mockInquiry = { id: 'inq-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.fetch = jest.fn();
  });

  it('initializes with isResponding as false', () => {
    const { result } = renderHook(() => useInquiryDetailLogic(mockInquiry));
    expect(result.current.isResponding).toBe(false);
  });

  it('handles successful response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });

    const { result } = renderHook(() => useInquiryDetailLogic(mockInquiry));

    await act(async () => {
      await result.current.handleRespond('APPROVED', 'Welcome!');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/landlord/inquiries?id=inq-123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', message: 'Welcome!' })
    });

    expect(toast.loading).toHaveBeenCalledWith('Marking inquiry as approved...');
    expect(toast.success).toHaveBeenCalledWith('Inquiry approved.', { id: 'loading-toast-id' });
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/landlord/inquiries');
    expect(result.current.isResponding).toBe(false);
  });

  it('handles failed response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' })
    });

    const { result } = renderHook(() => useInquiryDetailLogic(mockInquiry));
    
    await act(async () => {
      await result.current.handleRespond('REJECTED', 'No pets');
    });

    expect(toast.loading).toHaveBeenCalledWith('Marking inquiry as rejected...');
    expect(toast.error).toHaveBeenCalledWith('Failed to update status.', { id: 'loading-toast-id' });
    expect(mockRouter.refresh).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(result.current.isResponding).toBe(false);
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useInquiryDetailLogic(mockInquiry));
    
    await act(async () => {
      await result.current.handleRespond('APPROVED');
    });

    expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred.', { id: 'loading-toast-id' });
    expect(result.current.isResponding).toBe(false);
  });
});
