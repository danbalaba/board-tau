import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordPropertyManagement from '../index';
import { usePropertyLogic } from '../hooks/use-property-logic';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('kbar', () => ({
  useRegisterActions: jest.fn(),
}));

jest.mock('../hooks/use-property-logic', () => ({
  usePropertyLogic: jest.fn(),
}));

jest.mock('../components/landlord-property-header', () => ({
  LandlordPropertyHeader: () => <div data-testid="header-mock" />,
}));

jest.mock('../components/landlord-property-card', () => ({
  LandlordPropertyCard: ({ onView, onDelete, onArchive }: any) => (
    <div data-testid="card-mock">
      <button onClick={() => onView({ id: '1' })}>View</button>
      <button onClick={() => onDelete({ id: '1' })}>Delete</button>
      <button onClick={() => onArchive({ id: '1' })}>Archive</button>
    </div>
  ),
}));

jest.mock('../components/landlord-property-details-modal', () => ({
  LandlordPropertyDetailsModal: ({ onClose }: any) => (
    <div data-testid="details-modal">
      <button onClick={onClose}>Close Details</button>
    </div>
  ),
}));

jest.mock('../components/landlord-property-delete-modal', () => ({
  LandlordPropertyDeleteModal: ({ onClose }: any) => (
    <div data-testid="delete-modal">
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}));

jest.mock('../components/landlord-property-archive-modal', () => ({
  LandlordPropertyArchiveModal: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="archive-modal">
        <button onClick={() => onClose(false)}>Close Archive</button>
      </div>
    ) : null,
}));

jest.mock('../../shared/landlord-pagination', () => ({
  LandlordPagination: () => <div data-testid="pagination-mock" />,
}));

describe('LandlordPropertyManagement Index', () => {
  const mockSetViewModalOpen = jest.fn();
  const mockSetDeleteModalOpen = jest.fn();
  const mockSetArchiveModalOpen = jest.fn();
  const mockSetSelectedProperty = jest.fn();
  const mockHandleClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (usePropertyLogic as jest.Mock).mockReturnValue({
      listings: [{ id: '1', title: 'Test Property', price: 1000 }],
      totalListings: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
      itemsPerPage: 10,
      setItemsPerPage: jest.fn(),
      deleteModalOpen: false,
      setDeleteModalOpen: mockSetDeleteModalOpen,
      viewModalOpen: false,
      setViewModalOpen: mockSetViewModalOpen,
      archiveModalOpen: false,
      setArchiveModalOpen: mockSetArchiveModalOpen,
      selectedProperty: null,
      setSelectedProperty: mockSetSelectedProperty,
      isDeleting: false,
      isArchiving: false,
      sortBy: 'newest',
      setSortBy: jest.fn(),
      viewMode: 'grid',
      setViewMode: jest.fn(),
      searchQuery: '',
      setSearchQuery: jest.fn(),
      categoryFilter: 'all',
      setCategoryFilter: jest.fn(),
      isArchived: false,
      setIsArchived: jest.fn(),
      uniqueCategories: [],
      handleConfirmDelete: jest.fn(),
      handleGenerateReport: jest.fn(),
      handleClearFilters: mockHandleClearFilters,
      handleConfirmArchive: jest.fn(),
      isLoading: false
    });
  });

  it('renders correctly with properties', () => {
    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-mock')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-mock')).toBeInTheDocument();
  });

  it('shows empty state when no properties', () => {
    (usePropertyLogic as jest.Mock).mockReturnValue({
      listings: [],
      totalListings: 0,
      isLoading: false
    });

    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    expect(screen.getByText('No listings found')).toBeInTheDocument();
  });

  it('opens details modal when card view is clicked', () => {
    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    fireEvent.click(screen.getByText('View'));
    
    expect(mockSetSelectedProperty).toHaveBeenCalledWith({ id: '1' });
    expect(mockSetViewModalOpen).toHaveBeenCalledWith(true);
  });

  it('opens delete modal when card delete is clicked', () => {
    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    fireEvent.click(screen.getByText('Delete'));
    
    expect(mockSetSelectedProperty).toHaveBeenCalledWith({ id: '1' });
    expect(mockSetDeleteModalOpen).toHaveBeenCalledWith(true);
  });

  it('opens archive modal when card archive is clicked', () => {
    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    fireEvent.click(screen.getByText('Archive'));
    
    expect(mockSetSelectedProperty).toHaveBeenCalledWith({ id: '1' });
    expect(mockSetArchiveModalOpen).toHaveBeenCalledWith(true);
  });

  it('renders modals when state is true', () => {
    (usePropertyLogic as jest.Mock).mockReturnValue({
      listings: [{ id: '1', title: 'Test Property', price: 1000 }],
      viewModalOpen: true,
      deleteModalOpen: true,
      archiveModalOpen: true,
      selectedProperty: { id: '1' },
      isLoading: false
    });

    render(<LandlordPropertyManagement properties={{ listings: [], nextCursor: null }} />);
    
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    expect(screen.getByTestId('archive-modal')).toBeInTheDocument();
  });
});
