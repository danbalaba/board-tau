import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordInquiryCard } from '../landlord-inquiry-card';
import { Inquiry } from '../../hooks/use-inquiry-logic';

jest.mock('@/components/common/Avatar', () => {
  return function MockAvatar({ name }: any) {
    return <div data-testid="avatar">{name}</div>;
  };
});

jest.mock('@/components/common/Button', () => {
  return {
    __esModule: true,
    default: function MockButton({ children, onClick, title, className }: any) {
      return <button onClick={onClick} title={title} className={className}>{children}</button>;
    }
  };
});

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: function MockSafeImage({ alt }: any) {
      return <img alt={alt} data-testid="safe-image" />;
    }
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, transition, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    },
  };
});

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'IconClock') return () => <div data-testid="icon-clock" />;
      if (prop === 'IconCircleCheck') return () => <div data-testid="icon-check" />;
      if (prop === 'IconCircleX') return () => <div data-testid="icon-x" />;
      if (prop === 'IconArchive') return () => <div data-testid="icon-archive" />;
      if (prop === 'IconRestore') return () => <div data-testid="icon-restore" />;
      if (prop === 'IconTrash') return () => <div data-testid="icon-trash" />;
      if (prop === 'IconEye') return () => <div data-testid="icon-eye" />;
      if (prop === 'IconCalendarEvent') return () => <div data-testid="icon-calendar" />;
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

const mockInquiry: Inquiry = {
  id: 'inq-1',
  listingId: 'list-1',
  roomId: 'room-1',
  userId: 'user-1',
  moveInDate: '2025-01-01',
  checkOutDate: '2025-06-01',
  occupantsCount: 1,
  role: 'tenant',
  status: 'PENDING',
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  listing: {
    id: 'list-1',
    title: 'Test Listing',
    imageSrc: '/img.jpg'
  },
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  },
  room: {
    id: 'room-1',
    name: 'Test Room',
    price: 5000
  }
};

describe('LandlordInquiryCard', () => {
  const mockHandleRespond = jest.fn();
  const mockOnArchive = jest.fn();
  const mockOnReject = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnViewDetails = jest.fn();

  const defaultProps = {
    inquiry: mockInquiry,
    idx: 0,
    viewMode: 'grid' as const,
    handleRespond: mockHandleRespond,
    onArchive: mockOnArchive,
    onReject: mockOnReject,
    onDelete: mockOnDelete,
    onViewDetails: mockOnViewDetails,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in grid mode', () => {
    render(<LandlordInquiryCard {...defaultProps} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getByText('₱5,000')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText(/Details/i)).toBeInTheDocument();
  });

  it('calls onViewDetails when Details button is clicked', () => {
    render(<LandlordInquiryCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Details'));
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('calls handleRespond with APPROVED when Approve is clicked', () => {
    render(<LandlordInquiryCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Approve'));
    expect(mockHandleRespond).toHaveBeenCalledWith('inq-1', 'APPROVED');
  });

  it('calls onReject when Reject is clicked', () => {
    render(<LandlordInquiryCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Reject'));
    expect(mockOnReject).toHaveBeenCalledWith('inq-1');
  });

  it('renders correctly in list mode', () => {
    render(<LandlordInquiryCard {...defaultProps} viewMode="list" />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText(/Manage/i)).toBeInTheDocument();
  });

  it('calls onArchive when archive button is clicked in list mode', () => {
    render(<LandlordInquiryCard {...defaultProps} viewMode="list" />);
    const archiveBtn = screen.getByTitle('Archive Inquiry');
    fireEvent.click(archiveBtn);
    expect(mockOnArchive).toHaveBeenCalledWith('inq-1');
  });

  it('calls onDelete when delete button is clicked in list mode (for archived)', () => {
    const archivedInquiry = { ...mockInquiry, isArchived: true };
    render(<LandlordInquiryCard {...defaultProps} inquiry={archivedInquiry} viewMode="list" />);
    const deleteBtn = screen.getByTitle('Permanently Delete (Purge Files)');
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith(archivedInquiry);
  });
});
