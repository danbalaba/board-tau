import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LandlordInquiryCenter from '../index';
import { useSearchParams } from 'next/navigation';
import { useRegisterActions } from 'kbar';
import { useInquiryLogic } from '../hooks/use-inquiry-logic';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}));

jest.mock('kbar', () => ({
  useRegisterActions: jest.fn()
}));

jest.mock('../hooks/use-inquiry-logic', () => ({
  useInquiryLogic: jest.fn()
}));

jest.mock('../components/landlord-inquiry-header', () => ({
  LandlordInquiryHeader: () => <div data-testid="inquiry-header" />
}));

jest.mock('../components/landlord-inquiry-card', () => ({
  LandlordInquiryCard: ({ inquiry }: any) => <div data-testid={`inquiry-card-${inquiry.id}`} />
}));

jest.mock('../components/landlord-inquiry-modals', () => ({
  LandlordInquiryModals: () => <div data-testid="inquiry-modals" />
}));

jest.mock('../../shared/landlord-pagination', () => ({
  LandlordPagination: () => <div data-testid="pagination" />
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
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

const mockInquiriesData = {
  inquiries: [],
  nextCursor: null
};

describe('LandlordInquiryCenter', () => {
  const mockLogicReturn = {
    filteredInquiries: [],
    totalInquiries: 0,
    currentPage: 1,
    setCurrentPage: jest.fn(),
    itemsPerPage: 10,
    setItemsPerPage: jest.fn(),
    selectedStatus: 'ALL',
    setSelectedStatus: jest.fn(),
    viewMode: 'grid',
    setViewMode: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    sortBy: 'newest',
    setSortBy: jest.fn(),
    selectedInquiry: null,
    setSelectedInquiry: jest.fn(),
    viewModalOpen: false,
    setViewModalOpen: jest.fn(),
    deleteModalOpen: false,
    setDeleteModalOpen: jest.fn(),
    rejectModalOpen: false,
    setRejectModalOpen: jest.fn(),
    archiveModalOpen: false,
    setArchiveModalOpen: jest.fn(),
    isDeleting: false,
    respondingId: null,
    isArchiving: false,
    isLoadingMore: false,
    nextCursor: null,
    handleConfirmDelete: jest.fn(),
    handleConfirmArchive: jest.fn(),
    handleRespond: jest.fn(),
    handleConfirmReject: jest.fn(),
    handleGenerateReport: jest.fn(),
    isArchived: false,
    handleToggleArchived: jest.fn(),
    rawInquiries: [],
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    });
    (useInquiryLogic as jest.Mock).mockReturnValue(mockLogicReturn);
  });

  it('renders loading state when isLoading is true', () => {
    (useInquiryLogic as jest.Mock).mockReturnValue({
      ...mockLogicReturn,
      isLoading: true
    });
    render(<LandlordInquiryCenter inquiries={mockInquiriesData} />);
    expect(screen.getByText('Syncing Inquiries')).toBeInTheDocument();
  });

  it('renders empty state when there are no filtered inquiries', () => {
    render(<LandlordInquiryCenter inquiries={mockInquiriesData} />);
    expect(screen.getByText('Box is Empty')).toBeInTheDocument();
  });

  it('renders inquiry cards and pagination when there are filtered inquiries', () => {
    const mockInquiry = { id: '1', user: { name: 'John' }, listing: { title: 'Prop' } };
    (useInquiryLogic as jest.Mock).mockReturnValue({
      ...mockLogicReturn,
      filteredInquiries: [mockInquiry],
      totalInquiries: 1,
      rawInquiries: [mockInquiry]
    });

    render(<LandlordInquiryCenter inquiries={mockInquiriesData} />);
    
    expect(screen.getByTestId('inquiry-header')).toBeInTheDocument();
    expect(screen.getByTestId('inquiry-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('inquiry-modals')).toBeInTheDocument();
    expect(screen.getByText(/Showing 1 inquiry/i)).toBeInTheDocument();
  });

  it('opens view modal if search params has id and it exists in rawInquiries', () => {
    const mockInquiry = { id: 'test-id', user: { name: 'John' }, listing: { title: 'Prop' } };
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('test-id')
    });
    
    const mockSetSelectedInquiry = jest.fn();
    const mockSetViewModalOpen = jest.fn();

    (useInquiryLogic as jest.Mock).mockReturnValue({
      ...mockLogicReturn,
      rawInquiries: [mockInquiry],
      viewModalOpen: false,
      setSelectedInquiry: mockSetSelectedInquiry,
      setViewModalOpen: mockSetViewModalOpen
    });

    render(<LandlordInquiryCenter inquiries={mockInquiriesData} />);
    
    expect(mockSetSelectedInquiry).toHaveBeenCalledWith(mockInquiry);
    expect(mockSetViewModalOpen).toHaveBeenCalledWith(true);
  });

  it('registers kbar actions based on rawInquiries', () => {
    const mockInquiry = { id: 'test-id', user: { name: 'John' }, listing: { title: 'Prop' } };
    (useInquiryLogic as jest.Mock).mockReturnValue({
      ...mockLogicReturn,
      rawInquiries: [mockInquiry]
    });

    render(<LandlordInquiryCenter inquiries={mockInquiriesData} />);
    
    expect(useRegisterActions).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'inquiry-test-id' })
      ]),
      [[mockInquiry]]
    );
  });
});
