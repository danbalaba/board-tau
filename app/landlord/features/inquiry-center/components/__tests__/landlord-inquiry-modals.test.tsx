import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LandlordInquiryModals } from '../landlord-inquiry-modals';
import { useIsClient } from '@/hooks/useIsClient';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('../landlord-inquiry-details-modal', () => ({
  LandlordInquiryDetailsModal: ({ isOpen }: any) => {
    return isOpen ? <div data-testid="details-modal" /> : null;
  }
}));

jest.mock('../landlord-inquiry-archive-modal', () => {
  return function MockArchiveModal({ isOpen, onConfirm }: any) {
    return isOpen ? (
      <div data-testid="archive-modal">
        <button onClick={onConfirm}>Confirm Archive Mock</button>
      </div>
    ) : null;
  };
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick }: any) {
    return <button onClick={onClick}>{children}</button>;
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

const mockInquiry: any = {
  id: '123',
  status: 'PENDING',
  user: { name: 'John Doe', email: 'john@example.com' },
  isArchived: false,
};

describe('LandlordInquiryModals', () => {
  const defaultProps = {
    deleteModalOpen: false,
    setDeleteModalOpen: jest.fn(),
    viewModalOpen: false,
    setViewModalOpen: jest.fn(),
    rejectModalOpen: false,
    setRejectModalOpen: jest.fn(),
    archiveModalOpen: false,
    setArchiveModalOpen: jest.fn(),
    selectedInquiry: mockInquiry,
    isDeleting: false,
    isResponding: false,
    isArchiving: false,
    handleConfirmDelete: jest.fn(),
    handleConfirmArchive: jest.fn(),
    handleConfirmReject: jest.fn(),
    handleRespond: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useIsClient as jest.Mock).mockReturnValue(true);
    (useRouter as jest.Mock).mockReturnValue({});
  });

  it('renders nothing when not client', () => {
    (useIsClient as jest.Mock).mockReturnValue(false);
    const { container } = render(<LandlordInquiryModals {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders archive modal when archiveModalOpen is true', () => {
    render(<LandlordInquiryModals {...defaultProps} archiveModalOpen={true} />);
    expect(screen.getByTestId('archive-modal')).toBeInTheDocument();
  });

  it('renders details modal when viewModalOpen is true', () => {
    render(<LandlordInquiryModals {...defaultProps} viewModalOpen={true} />);
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
  });

  it('renders delete modal when deleteModalOpen is true', () => {
    render(<LandlordInquiryModals {...defaultProps} deleteModalOpen={true} />);
    expect(screen.getAllByText('Delete Permanently').length).toBeGreaterThan(0);
  });

  it('renders reject modal when rejectModalOpen is true', () => {
    render(<LandlordInquiryModals {...defaultProps} rejectModalOpen={true} />);
    expect(screen.getByText('Decline Inquiry')).toBeInTheDocument();
  });

  it('calls handleConfirmDelete when delete is confirmed', () => {
    render(<LandlordInquiryModals {...defaultProps} deleteModalOpen={true} />);
    fireEvent.click(screen.getAllByText('Delete Permanently')[1]); // click the button
    expect(defaultProps.handleConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it('calls handleConfirmArchive from archive modal', () => {
    render(<LandlordInquiryModals {...defaultProps} archiveModalOpen={true} />);
    fireEvent.click(screen.getByText('Confirm Archive Mock'));
    expect(defaultProps.handleConfirmArchive).toHaveBeenCalledTimes(1);
  });

  it('handles reject flow correctly', async () => {
    render(<LandlordInquiryModals {...defaultProps} rejectModalOpen={true} />);
    
    // Quick reason selection
    fireEvent.click(screen.getByText('Room no longer available'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Decline'));
    });

    expect(defaultProps.handleConfirmReject).toHaveBeenCalledWith('123', 'Room no longer available');
  });

  it('handles custom reject flow correctly', async () => {
    render(<LandlordInquiryModals {...defaultProps} rejectModalOpen={true} />);
    
    // Custom reason
    fireEvent.click(screen.getByText('Write a custom reason...'));
    const textarea = screen.getByPlaceholderText('Describe your reason here...');
    fireEvent.change(textarea, { target: { value: 'Custom reason text' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Decline'));
    });

    expect(defaultProps.handleConfirmReject).toHaveBeenCalledWith('123', 'Custom reason text');
  });
});
